# Lab tags. Every reference an article makes — to code, to a RAM variable —
# is resolved at build time, and a broken reference FAILS the build.
# Nothing is copied into posts, so prose can't drift from code or data.
#
#   {% snippet baseball-stars:src/phases/fielding.js match:FIELDER_SPEED context:1 %}
#   {% snippet baseball-stars:src/phases/fielding.js lines:19-20 %}
#
# The part before ":" names a repo in `code_roots` (_config.yml).
#   {% ram baseball-stars pitch_speed %}

require "cgi"
require "json"
require "rouge"

module Lab
  class Error < StandardError; end

  CONFIDENCE = %w[guess observed confirmed].freeze
  ADDR = /\A\$[0-9A-F]{4}\z/

  def self.ram(site, game)
    site.data.dig("ram", game) or raise Error, "no RAM map: _data/ram/#{game}.yml"
  end

  def self.anchor(name) = "ram-#{name}"

  # Parse "path key:value key:value" tag markup.
  def self.parse(markup)
    path, *rest = markup.strip.split(/\s+/)
    [path, rest.to_h { |kv| kv.split(":", 2) }]
  end

  class SnippetTag < Liquid::Tag
    LANGS = { ".js" => "javascript", ".lua" => "lua", ".asm" => "nasm", ".s" => "nasm", ".rb" => "ruby" }.freeze

    def initialize(tag, markup, tokens)
      super
      @path, @opts = Lab.parse(markup)
    end

    def render(context)
      site = context.registers[:site]
      repo, rel = @path.split(":", 2)
      raise Error, "snippet: #{@path} must be <repo>:<path>" unless rel
      roots = site.config["code_roots"] || {}
      raise Error, "snippet: unknown repo '#{repo}' (code_roots: #{roots.keys.join(", ")})" unless roots[repo]
      file = File.join(File.expand_path(roots[repo], site.source), rel)
      raise Error, "snippet: #{@path} not found at #{file}" unless File.file?(file)

      lines = File.readlines(file, chomp: true)
      first, last = range(lines)
      code = lines[first..last].join("\n")
      lexer = Rouge::Lexer.find(LANGS.fetch(File.extname(file), "plaintext")) || Rouge::Lexers::PlainText
      html = Rouge::Formatters::HTML.new.format(lexer.lex(code))

      label = "#{@path}:#{first + 1}#{last > first ? "–#{last + 1}" : ""}"
      base = (site.config["code_urls"] || {})[repo].to_s
      caption = if base.empty?
        "<code>#{CGI.escapeHTML(label)}</code>"
      else
        href = "#{base}/#{rel}#L#{first + 1}-L#{last + 1}"
        "<a href=\"#{CGI.escapeHTML(href)}\"><code>#{CGI.escapeHTML(label)}</code></a>"
      end

      <<~HTML
        <figure class="snippet">
        <div class="highlight"><pre class="highlight"><code>#{html}</code></pre></div>
        <figcaption>#{caption}</figcaption>
        </figure>
      HTML
    end

    private

    def range(lines)
      if (spec = @opts["lines"])
        a, b = spec.split("-").map(&:to_i)
        b ||= a
        raise Error, "snippet: #{@path} lines:#{spec} out of range (1–#{lines.size})" unless a.between?(1, b) && b <= lines.size
        [a - 1, b - 1]
      elsif (needle = @opts["match"])
        hits = lines.each_index.select { |i| lines[i].include?(needle) }
        raise Error, "snippet: '#{needle}' not found in #{@path}" if hits.empty?
        ctx = @opts.fetch("context", "0").to_i
        before = @opts.fetch("before", ctx).to_i
        after = @opts.fetch("after", ctx).to_i
        [[hits.first - before, 0].max, [hits.first + after, lines.size - 1].min]
      else
        raise Error, "snippet: #{@path} needs lines:A-B or match:TEXT"
      end
    end
  end

  class RamTag < Liquid::Tag
    def initialize(tag, markup, tokens)
      super
      @game, @name = markup.split
    end

    def render(context)
      site = context.registers[:site]
      var = Lab.ram(site, @game).find { |v| v["name"] == @name }
      raise Error, "ram: '#{@name}' not in _data/ram/#{@game}.yml" unless var

      href = "#{site.config["baseurl"]}/#{@game}/##{Lab.anchor(@name)}"
      label = @name.tr("_", " ")
      tip = "#{var["addr"]} · #{var["confidence"]} — #{var["desc"]}"
      # Readers follow the name; developers get the address, and the link to the RAM map.
      %(<a class="ram ram--#{var["confidence"]}" href="#{href}" title="#{CGI.escapeHTML(tip)}">#{CGI.escapeHTML(label)}<code class="ram__addr">#{var["addr"]}</code></a>)
    end
  end

  # Validate every RAM map before anything renders.
  class RamValidator < Jekyll::Generator
    priority :highest

    def generate(site)
      (site.data["ram"] || {}).each do |game, vars|
        vars ||= []
        raise Error, "_data/ram/#{game}.yml must be a list" unless vars.is_a?(Array)
        names = vars.map { |v| v["name"] }
        dupes = names.tally.select { |_, n| n > 1 }.keys
        raise Error, "_data/ram/#{game}.yml duplicate names: #{dupes.join(", ")}" if dupes.any?
        vars.each do |v|
          where = "_data/ram/#{game}.yml #{v["name"].inspect}"
          raise Error, "#{where}: addr must look like $00A4" unless v["addr"].to_s.match?(ADDR)
          raise Error, "#{where}: confidence must be one of #{CONFIDENCE.join("/")}" unless CONFIDENCE.include?(v["confidence"])
          raise Error, "#{where}: missing desc" if v["desc"].to_s.strip.empty?
        end
      end
    end
  end

  # Validate each storyboard, and every sketch's place in it.
  class StoryboardValidator < Jekyll::Generator
    priority :highest
    STATUS = %w[expected observed].freeze

    def generate(site)
      roots = site.config["code_roots"] || {}
      boards = site.data["storyboard"] || {}
      boards.each do |game, board|
        where = "_data/storyboard/#{game}.yml"
        systems = (board["systems"] || []).map { |s| s["id"] }
        ids = []
        (board["acts"] || []).each do |act|
          raise Error, "#{where} act #{act["id"]}: interlude '#{act["interlude"]}' not in systems" if act["interlude"] && !systems.include?(act["interlude"])
          (act["scenes"] || []).each do |sc|
            at = "#{where} scene #{sc["id"].inspect}"
            ids << sc["id"]
            raise Error, "#{at}: status must be #{STATUS.join("/")}" unless STATUS.include?(sc["status"])
            raise Error, "#{at}: observed scenes need a shot (<run>/<shot>)" if sc["status"] == "observed" && sc["shot"].to_s.empty?
            if site.config["workbench"] && sc["shot"]
              png = File.join(site.source, "workbench", game, "runs", "#{sc["shot"]}.png")
              raise Error, "#{at}: shot #{sc["shot"]} not found in workbench (rerun its experiment)" unless File.file?(png)
            end
            %w[title what].each { |k| raise Error, "#{at}: missing #{k}" if sc[k].to_s.strip.empty? }
            next unless sc["remake"]
            repo, rel = sc["remake"].split(":", 2)
            raise Error, "#{at}: remake repo '#{repo}' not in code_roots" unless roots[repo] && rel
            file = File.join(File.expand_path(roots[repo], site.source), rel)
            raise Error, "#{at}: remake #{sc["remake"]} not found" unless File.file?(file)
          end
        end
        dupes = ids.tally.select { |_, n| n > 1 }.keys
        raise Error, "#{where}: duplicate scene ids: #{dupes.join(", ")}" if dupes.any?
      end

      (site.collections["episodes"]&.docs || []).each do |ep|
        scene = ep.data["scene"] or next
        board = boards[ep.data["game"]] or raise Error, "#{ep.relative_path}: no storyboard for game '#{ep.data["game"]}'"
        known = (board["acts"] || []).flat_map { |a| (a["scenes"] || []).map { |s| s["id"] } }
        raise Error, "#{ep.relative_path}: scene '#{scene}' not in _data/storyboard/#{ep.data["game"]}.yml" unless known.include?(scene)
      end
    end
  end
end

module Lab
  # Published screenshots: every PNG in assets/screens/<game>/ needs a provenance
  # record in _data/screens/<game>.yml (written by bench/promote.mjs), and every
  # record needs its PNG.
  class ScreensValidator < Jekyll::Generator
    priority :highest

    def generate(site)
      root = File.join(site.source, "assets", "screens")
      games = (Dir.exist?(root) ? Dir.children(root).select { |g| File.directory?(File.join(root, g)) } : []) | (site.data["screens"] || {}).keys
      games.each do |game|
        records = (site.data.dig("screens", game) || {})
        files = Dir.glob(File.join(root, game, "*.png")).map { |f| File.basename(f, ".png") }
        (files - records.keys).each { |n| raise Error, "assets/screens/#{game}/#{n}.png has no record in _data/screens/#{game}.yml — publish with bench/promote.mjs" }
        (records.keys - files).each { |n| raise Error, "_data/screens/#{game}.yml '#{n}' has no assets/screens/#{game}/#{n}.png" }
        records.each { |n, r| raise Error, "_data/screens/#{game}.yml '#{n}': missing frame" unless r.is_a?(Hash) && r["frame"].is_a?(Integer) }
      end
    end
  end

  # Workbench (local only): index ROM-derived runs and CHR banks into
  # site.data["workbench"][game] for workbench/index.html.
  class WorkbenchIndex < Jekyll::Generator
    def generate(site)
      return unless site.config["workbench"]
      root = File.join(site.source, "workbench")
      site.data["workbench"] = Dir.children(root).select { |g| File.directory?(File.join(root, g)) }.sort.to_h do |game|
        dir = File.join(root, game)
        runs = Dir.glob(File.join(dir, "runs", "*", "run.json")).sort.map do |f|
          run = JSON.parse(File.read(f))
          name = File.basename(File.dirname(f))
          shots = run["shots"].sort_by { |_, v| v["frame"] }.map do |shot, v|
            { "name" => shot, "frame" => v["frame"], "url" => "/workbench/#{game}/runs/#{name}/#{shot}.png" }
          end
          { "name" => name, "experiment" => run["experiment"], "frames" => run["frames"], "seconds" => run["seconds"], "shots" => shots }
        end
        chr_json = File.join(dir, "chr", "chr.json")
        chr = File.exist?(chr_json) ? JSON.parse(File.read(chr_json)) : nil
        chr["urls"] = chr["banks"].map { |b| "/workbench/#{game}/chr/#{b}" } if chr
        [game, { "runs" => runs, "chr" => chr }]
      end
    end
  end
end

module Lab
  # {{ subject | lab_fail: "why" }} — lets an include fail the build loudly.
  module Filters
    def lab_fail(subject, why)
      raise Error, "#{subject}: #{why}"
    end
  end
end

Liquid::Template.register_filter(Lab::Filters)

# Last line of defense behind the exclude list: no build may contain a ROM,
# a disk image, or an archive, whatever it's named or wherever it sits.
Jekyll::Hooks.register :site, :post_write do |site|
  leaks = Dir.glob(File.join(site.dest, "**", "*"), File::FNM_DOTMATCH | File::FNM_CASEFOLD)
    .select { |f| File.file?(f) && f.match?(/\.(nes|fds|unf|unif|zip|7z|rar)\z/i) }
  unless leaks.empty?
    raise Lab::Error, "no ROMs or archives in a build: #{leaks.first(3).map { |f| f.delete_prefix(site.dest) }.join(", ")}"
  end
end
Liquid::Template.register_tag("snippet", Lab::SnippetTag)
Liquid::Template.register_tag("ram", Lab::RamTag)
