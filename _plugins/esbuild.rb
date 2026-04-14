require "open3"
require "fileutils"

Jekyll::Hooks.register :site, :post_write do |site|
  next if Jekyll.env == "development"

  js_dir = File.join(site.dest, "js")
  next unless Dir.exist?(js_dir)

  target = site.config.dig("esbuild", "target")
  unless target
    raise "No browser target set for esbuild"
  end

  js_files = Dir.glob(File.join(js_dir, "*.js"))

  js_files.each do |file|
    cmd = [
      "npx", "esbuild",
      "--minify",
      "--bundle",
      "--target=#{target}",
      file,
      "--outfile=#{file}",
      "--allow-overwrite"
    ]

    _out, err, status = Open3.capture3(*cmd)

    unless status.success?
      raise "esbuild failed on #{file}:\n#{err}"
    end
  end

  module_dir = File.join(js_dir, "module")
  FileUtils.rm_rf(module_dir) if Dir.exist?(module_dir)

  Jekyll.logger.info "esbuild:", "processed #{js_files.size} file(s)"
end
