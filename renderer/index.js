const { ipcRenderer } = require('electron')
const { $,convertDuration } = require('./helper')
const musicAudio = new Audio()

let allTracks
let currentTrack

$('add-music-btn').addEventListener('click', () => {
  ipcRenderer.send('add-music-window')
})

const renderListHTML = tracks => {
  const trackList = $('trackList')
  const trackListHTML = tracks.reduce((html, track) => {
    html += `<li class="music-track list-group-item d-flex justify-content-between align-items-center">
    <div class="col-10">
      <i class="fas fa-music mr-2 text-secondary"></i>
      <b>${track.fileName}</b>
    </div>
    <div class = "col-2">
      <i class="fas fa-play mr-4" data-id="${track.id}"></i>
      <i class="fas fa-trash-alt" data-id="${track.id}"></i>
    </div>
    </li>`
    return html
  }, '')
  const emptyTrackHTML = '<div class = "alert alert-primary">未添加音乐</div>'
  trackList.innerHTML = tracks.length ? `<ul class = "list-group">${ trackListHTML}</ul>` : emptyTrackHTML
}

const renderPlayerHTML = (name, duration) => {
  const player = $('player-status')
  const html = `
  <div class = "col-8 font-weight-bold">
    正在播放：${name}
  </div>
  <div class = "col-4">
    <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
  </div>
  `
  player.innerHTML = html
}

const updateProgressHTML = (currentTime, duration) => {
  // 计算 progress
  const progress = Math.floor(currentTime / duration * 100)
  const bar = $('player-progress')
  bar.innerHTML = progress + '%'
  bar.style.width = progress + '%'
  const seeker = $('current-seeker')
  seeker.innerHTML = convertDuration(currentTime)
}

ipcRenderer.on('getTracks', (event, tracks) => {
  console.log('receive tracks', tracks)
  allTracks = tracks
  renderListHTML(tracks)
})

musicAudio.addEventListener('loadedmetadata', () => {
  //渲染播放器状态
  renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
  //更新播放器状态
  updateProgressHTML(musicAudio.currentTime, musicAudio.duration)
})

$('trackList').addEventListener('click', event => {
  event.preventDefault()
  const { dataset,classList } = event.target
  const id = dataset && dataset.id
  if (id && classList.contains('fa-play')) {
    //开始播放音乐
    if (currentTrack && currentTrack.id === id) {
      //继续播放音乐
      musicAudio.play()
    } else {
      //播放新的歌曲，并还原图标
      currentTrack = allTracks.find(track => track.id === id)
      musicAudio.src = currentTrack.path
      musicAudio.play()
      const resetIconEle = document.querySelector('.fa-pause')
      if (resetIconEle) {
        resetIconEle.classList.replace('fa-pause', 'fa-play')
      }
    }
    classList.replace('fa-play', 'fa-pause')
  } else if (id && classList.contains('fa-pause')) {
    //暂停音乐
    musicAudio.pause()
    classList.replace('fa-pause', 'fa-play')
  } else if (id && classList.contains('fa-trash-alt')) {
    //删除音乐
    ipcRenderer.send('delete-track', id)
  }
})