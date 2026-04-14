require "open3"
require "fileutils"

Jekyll::Hooks.register :site, :post_write do |site|
  next if Jekyll.env == "development"

  css_dir = File.join(site.dest, "css")
  next unless Dir.exist?(css_dir)

  targets = site.config.dig("lightningcss", "targets")
  unless targets
    raise "No browser target set for lightningcss"
  end

  css_files = Dir.glob(File.join(css_dir, "*.css"))

  css_files.each do |file|
    cmd = [
      "npx", "lightningcss",
      "--minify",
      "--bundle",
      "--sourcemap",
      "--targets", targets,
      file,
      "-o", file
    ]

    _out, err, status = Open3.capture3(*cmd)

    unless status.success?
      raise "lightningcss failed on #{file}:\n#{err}"
    end
  end

  module_dir = File.join(css_dir, "module")
  FileUtils.rm_rf(module_dir) if Dir.exist?(module_dir)

  Jekyll.logger.info "LightningCSS:", "processed #{css_files.size} file(s)"
end
