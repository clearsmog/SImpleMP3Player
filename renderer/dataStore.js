const store = require('electron-store')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

class dataStore extends store {
  constructor(settings) {
    super(settings)
    this.tracks = this.get('tracks') || []
  }

  setTracks() {
    this.set('tracks', this.tracks)
    return this
  }
  getTracks() {
    return this.get('tracks') || []
  }
  addTracks(tracks) {
    const tracksWithProps = tracks.map(track => {
      return {
        id: uuidv4(),
        path: track,
        fileName: path.basename(track)
			}
    }).filter(track => {
      const currentTracksPath = this.getTracks().map(track => track.path)
      return currentTracksPath.indexOf(track.path) < 0
    })
    this.tracks = [...this.tracks, ...tracksWithProps]
    return this.setTracks()
  }

  deleteTrack(id) {
    this.tracks = this.tracks.filter(item => item.id !== id)
    return this.setTracks()
  }
}

module.exports = dataStore