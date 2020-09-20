" https://vim.fandom.com/wiki/Multiple_commands_at_once
" https://vi.stackexchange.com/a/3886
" https://stackoverflow.com/questions/24782903/vim-mapping-for-visual-line-mode
" javax/servlet/http/HttpServletResponse.class -> import javax.servlet.http.HttpServletResponse
xmap ,i :s/\//./g<bar>s/^/import /g<bar>s/\.class//g<CR>

" NERDTree mappings (https://stackoverflow.com/a/7692315)
nmap ,n :NERDTreeFind<CR>
nmap ,m :NERDTreeToggle<CR>
