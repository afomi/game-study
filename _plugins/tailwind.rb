# Compile Tailwind after every build (pattern from afomi/jekyll-with-tailwind),
# but fail loudly: a non-zero exit, or no CSS file afterwards, stops the build
# instead of shipping an unstyled site.
require "open3"

Jekyll::Hooks.register :site, :post_write do |site|
  input = File.join(site.source, "assets/css/tailwind.css")
  output = File.join(site.dest, "assets/css/main.css")
  cli = File.join(site.source, "node_modules/.bin/tailwindcss")
  raise "tailwind: #{cli} missing — run `npm install`" unless File.executable?(cli)

  out, status = Open3.capture2e(cli, "-i", input, "-o", output, "--minify", chdir: site.source)
  raise "tailwind: build failed (#{status.exitstatus}):\n#{out}" unless status.success?
  raise "tailwind: #{output} was not written" unless File.size?(output)
  Jekyll.logger.info "Tailwind:", "#{File.size(output) / 1024} KB → #{output.delete_prefix(site.dest)}"
end
