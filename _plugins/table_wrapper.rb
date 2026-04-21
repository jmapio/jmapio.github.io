def self.wrap_tables(output)
  output.gsub(%r{<table([\s>])}i, '<div class="table-wrapper"><table\1')
        .gsub(%r{</table>}i, '</table></div>')
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  next unless doc.extname == ".md"
  doc.output = wrap_tables(doc.output)
end

Jekyll::Hooks.register :pages, :post_render do |page|
  next unless page.output && page.extname == ".md"
  page.output = wrap_tables(page.output)
end
