import { Licenses } from './licenses';

export const devEnvironment = [{
    name: 'vim',
    url: 'https://github.com/vim/vim',
    license: { name: 'VIM LICENCE', url: 'https://github.com/vim/vim/blob/master/LICENSE' },
    copyright: null
}, {
    name: 'neovim',
    url: 'https://github.com/neovim/neovim',
    license: [{ name: 'VIM LICENCE', url: 'https://github.com/vim/vim/blob/master/LICENSE' }, Licenses.APACHE],
    copyright: 'Copyright Neovim contributors. All rights reserved.'
}, {
    name: 'Visual Studio Code - Open Source ("Code - OSS")',
    url: 'https://github.com/microsoft/vscode',
    license: Licenses.MIT,
    copyright: 'Copyright (c) 2015 - present Microsoft Corporation'
}, {
    name: 'IntelliJ IDEA Community Edition',
    url: 'https://github.com/JetBrains/intellij-community',
    license: Licenses.APACHE,
    copyright: 'Copyright 2000-2018 JetBrains s.r.o.'
}, {
    name: 'Git',
    url: 'https://github.com/git/git',
    license: { name: 'License', url: 'https://github.com/git/git/blob/master/COPYING' },
    copyright: null
}, {
    name: 'WSL 2',
    url: 'https://github.com/microsoft/WSL2-Linux-Kernel',
    license: { name: 'License', url: 'https://github.com/microsoft/WSL2-Linux-Kernel/blob/master/COPYING' },
    copyright: null
}];
// TODO mention browsers ?
