const {
	ipcRenderer
} = require('electron')
const { $ } = require('./helper')
const path = require('path')
const { createCipher } = require('crypto')
const { clearScreenDown } = require('readline')

let FilesPath = []

$('select-music').addEventListener(
  'click',
  () => {
    ipcRenderer.send('open-music-files')
  }
)

$('add-music').addEventListener('click', () => {
  ipcRenderer.send('add-tracks', FilesPath)
})

const renderListHTML = (pathes) => {
  const musicList = $('musicList')
  const musicItemsHTML = pathes.reduce((html, eachPath) => {
    html += `<li class = 'list-group-item'>${path.basename(eachPath)}</li>`
    return html
  }, '')
  musicList.innerHTML = `<ul class= "list-group">${musicItemsHTML}</ul>`
}

ipcRenderer.on('selected-files', (event, path) => {
  renderListHTML(path)
  FilesPath = path
})
