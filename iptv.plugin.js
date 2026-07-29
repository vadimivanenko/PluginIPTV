(function () {
  if (window.plugin_iptv_loaded) return
  window.plugin_iptv_loaded = true

  var STORAGE_KEY = 'plugin_iptv_data'

  function defaults() {
    return { playlists: [], epg_url: '', favorites: [] }
  }

  function loadData() {
    try {
      var raw = Lampa.Storage.get(STORAGE_KEY)
      return raw ? JSON.parse(raw) : defaults()
    } catch (e) {
      return defaults()
    }
  }

  function saveData(data) {
    Lampa.Storage.set(STORAGE_KEY, JSON.stringify(data))
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  }

  var PUBLIC_PLAYLISTS = [
    {
      name: 'iptv-org — All channels',
      desc: '~8000+ открытых каналов со всего мира',
      url: 'https://iptv-org.github.io/iptv/index.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Categorized',
      desc: 'То же, но с группировкой по категориям',
      url: 'https://iptv-org.github.io/iptv/index.category.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Russia',
      desc: 'Российские каналы',
      url: 'https://iptv-org.github.io/iptv/countries/ru.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Ukraine',
      desc: 'Украинские каналы',
      url: 'https://iptv-org.github.io/iptv/countries/ua.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — USA',
      desc: 'Американские каналы',
      url: 'https://iptv-org.github.io/iptv/countries/us.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — UK',
      desc: 'Британские каналы',
      url: 'https://iptv-org.github.io/iptv/countries/gb.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Germany',
      desc: 'Немецкие каналы',
      url: 'https://iptv-org.github.io/iptv/countries/de.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — News',
      desc: 'Новостные каналы',
      url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Sports',
      desc: 'Спортивные каналы',
      url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Entertainment',
      desc: 'Развлекательные каналы',
      url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Music',
      desc: 'Музыкальные каналы',
      url: 'https://iptv-org.github.io/iptv/categories/music.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Movies',
      desc: 'Кино и сериалы',
      url: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    },
    {
      name: 'iptv-org — Kids',
      desc: 'Детские каналы',
      url: 'https://iptv-org.github.io/iptv/categories/kids.m3u',
      epg: 'https://iptv-org.github.io/epg/iptv-org.xml'
    }
  ]

  function addPlaylistUrl(url, name, epgUrl, callback) {
    if (!name) name = url.split('/').pop().replace(/\.(m3u8?|txt)$/i, '') || 'Playlist'
    Lampa.Noty.show('Loading ' + name + '...')
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var channels = parseM3U(xhr.responseText)
        var data = loadData()
        data.playlists.push({
          id: uid(),
          name: name,
          url: url,
          channels: channels.length
        })
        if (epgUrl && !data.epg_url) {
          data.epg_url = epgUrl
        }
        saveData(data)
        Lampa.Noty.show('Loaded ' + channels.length + ' channels from ' + name)
        if (callback) callback()
      } else {
        Lampa.Noty.show('Failed to load ' + name + ' (HTTP ' + xhr.status + ')')
        if (callback) callback()
      }
    }
    xhr.onerror = function () {
      Lampa.Noty.show('Network error loading ' + name)
      if (callback) callback()
    }
    xhr.send()
  }

  function openPublicBrowser(component) {
    var html = '<div class="iptv-modal">\
<div class="iptv-modal-inner">\
<h2>🌐 Public playlists</h2>\
<p style="color:#888;font-size:13px;margin:0 0 12px">Открытые плейлисты из проекта iptv-org. Нажмите "Add" для загрузки.</p>\
<div class="iptv-public-list">'

    for (var i = 0; i < PUBLIC_PLAYLISTS.length; i++) {
      var p = PUBLIC_PLAYLISTS[i]
      html += '<div class="iptv-public-item">\
<div class="iptv-public-info">\
<div class="iptv-public-name">' + p.name + '</div>\
<div class="iptv-public-desc">' + p.desc + '</div>\
</div>\
<button class="iptv-btn iptv-public-add" data-idx="' + i + '">Add</button>\
</div>'
    }

    html += '</div>\
<div class="iptv-btns">\
<button class="iptv-btn iptv-close-public">Close</button>\
</div>\
</div></div>'

    var modal = $(html)
    $('body').append(modal)

    modal.find('.iptv-public-add').on('click', function () {
      var idx = parseInt($(this).attr('data-idx'))
      var src = PUBLIC_PLAYLISTS[idx]
      $(this).html('⏳').addClass('active')
      addPlaylistUrl(src.url, src.name, src.epg, function () {
        modal.remove()
        if (component) component.start()
      })
    })

    modal.find('.iptv-close-public').on('click', function () {
      modal.remove()
    })
  }

  function parseM3U(content) {
    var channels = []
    var lines = content.split('\n')
    var current = null

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim()
      if (!line) continue

      if (line.indexOf('#EXTINF:') === 0) {
        current = {}
        var idMatch = line.match(/tvg-id="([^"]*)"/i)
        var nameMatch = line.match(/tvg-name="([^"]*)"/i)
        var logoMatch = line.match(/tvg-logo="([^"]*)"/i)
        var groupMatch = line.match(/group-title="([^"]*)"/i)

        current.id = idMatch ? idMatch[1] : uid()
        current.tvg_name = nameMatch ? nameMatch[1] : ''
        current.logo = logoMatch ? logoMatch[1] : ''
        current.group = groupMatch ? groupMatch[1] : 'Other'
        current.tvg_id = idMatch ? idMatch[1] : ''

        var commaIdx = line.lastIndexOf(',')
        current.name = commaIdx >= 0 ? line.substring(commaIdx + 1).trim() : 'Unknown'
        current.url = ''
      } else if (current && line.indexOf('#') !== 0) {
        current.url = line
        if (current.url) channels.push(current)
        current = null
      }
    }

    return channels
  }

  function parseEPG(xml) {
    var programs = {}
    try {
      var parser = new DOMParser()
      var doc = parser.parseFromString(xml, 'text/xml')
      var channels = doc.querySelectorAll('channel')
      for (var ci = 0; ci < channels.length; ci++) {
        var ch = channels[ci]
        var chId = ch.getAttribute('id')
        var iconEl = ch.querySelector('icon')
        if (iconEl && !programs[chId]) {
          programs[chId] = { logo: iconEl.getAttribute('src') || '', data: [] }
        } else if (!programs[chId]) {
          programs[chId] = { logo: '', data: [] }
        }
      }
      var programme = doc.querySelectorAll('programme')
      for (var pi = 0; pi < programme.length; pi++) {
        var prog = programme[pi]
        var pCh = prog.getAttribute('channel')
        if (!programs[pCh]) programs[pCh] = { logo: '', data: [] }
        programs[pCh].data.push({
          start: prog.getAttribute('start') || '',
          stop: prog.getAttribute('stop') || '',
          title: prog.querySelector('title') ? prog.querySelector('title').textContent : '',
          desc: prog.querySelector('desc') ? prog.querySelector('desc').textContent : '',
          category: prog.querySelector('category') ? prog.querySelector('category').textContent : ''
        })
      }
      for (var key in programs) {
        if (programs[key].data) {
          programs[key].data.sort(function (a, b) { return a.start.localeCompare(b.start) })
        }
      }
    } catch (e) {}
    return programs
  }

  function getCurrentProgram(epgData) {
    if (!epgData || !epgData.length) return null
    var now = new Date()
    var nowStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')
    for (var i = 0; i < epgData.length; i++) {
      var p = epgData[i]
      var startClean = p.start.replace(/[^0-9]/g, '').substring(0, 14)
      var stopClean = p.stop.replace(/[^0-9]/g, '').substring(0, 14)
      if (startClean <= nowStr && (!stopClean || stopClean > nowStr)) {
        return p
      }
    }
    return epgData.length > 0 ? epgData[0] : null
  }

  var CSS = '\
.iptv-main {\
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;\
  background: #141414; color: #fff; font-family: "Helvetica Neue", Arial, sans-serif;\
  display: flex; flex-direction: column;\
}\
.iptv-topbar {\
  display: flex; align-items: center; padding: 10px 20px;\
  background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%);\
  border-bottom: 1px solid #2a2a2a; min-height: 50px;\
}\
.iptv-title {\
  font-size: 22px; font-weight: 700; flex: 1;\
}\
.iptv-btn {\
  background: #2a2a2a; border: none; color: #fff;\
  padding: 8px 16px; border-radius: 4px; cursor: pointer;\
  font-size: 14px; margin-left: 8px; text-align: center;\
}\
.iptv-btn:hover,\
.iptv-btn:focus {\
  background: #3a3a3a; outline: none;\
}\
.iptv-btn.active {\
  background: #e50914; color: #fff;\
}\
.iptv-bar {\
  display: flex; overflow-x: auto; padding: 8px 20px;\
  gap: 6px; background: #1a1a1a; border-bottom: 1px solid #2a2a2a;\
  -webkit-overflow-scrolling: touch;\
}\
.iptv-bar::-webkit-scrollbar { height: 0; }\
.iptv-cat {\
  flex-shrink: 0; padding: 6px 16px; border-radius: 16px;\
  background: #2a2a2a; color: #999; font-size: 13px; cursor: pointer;\
  border: 1px solid transparent; transition: all 0.15s;\
}\
.iptv-cat:hover,\
.iptv-cat:focus {\
  color: #fff; background: #3a3a3a; outline: none;\
}\
.iptv-cat.sel {\
  color: #fff; background: #e50914; border-color: #e50914;\
}\
.iptv-grid {\
  flex: 1; overflow-y: auto; padding: 12px 16px;\
  display: flex; flex-wrap: wrap; align-content: flex-start;\
  gap: 10px;\
}\
.iptv-grid::-webkit-scrollbar { width: 6px; }\
.iptv-grid::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }\
.iptv-card {\
  width: calc(20% - 10px); min-width: 140px; max-width: 220px;\
  background: #1e1e1e; border-radius: 8px; overflow: hidden;\
  cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;\
  position: relative;\
}\
.iptv-card:hover,\
.iptv-card:focus {\
  transform: translateY(-2px);\
  box-shadow: 0 4px 20px rgba(229, 9, 20, 0.3);\
  outline: none;\
}\
.iptv-card:focus {\
  box-shadow: 0 0 0 2px #e50914, 0 4px 20px rgba(229, 9, 20, 0.3);\
}\
.iptv-card-logo {\
  width: 100%; padding-top: 56.25%; position: relative;\
  background: #111;\
}\
.iptv-card-logo img {\
  position: absolute; top: 10%; left: 10%;\
  width: 80%; height: 80%; object-fit: contain;\
}\
.iptv-card-name {\
  padding: 8px 10px; font-size: 12px; font-weight: 500;\
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\
  text-align: center;\
}\
.iptv-card-fav {\
  position: absolute; top: 4px; right: 4px;\
  font-size: 18px; color: #666;\
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);\
  transition: color 0.15s;\
}\
.iptv-card-fav.on {\
  color: #ffd700;\
}\
.iptv-card-now {\
  position: absolute; bottom: 32px; left: 0; right: 0;\
  padding: 4px 8px; background: rgba(0,0,0,0.7);\
  font-size: 10px; color: #aaa; line-height: 1.3;\
  max-height: 32px; overflow: hidden;\
}\
.iptv-empty {\
  flex: 1; display: flex; align-items: center; justify-content: center;\
  color: #555; font-size: 16px; flex-direction: column; gap: 12px;\
}\
.iptv-empty .iptv-btn {\
  font-size: 16px; padding: 12px 32px;\
}\
.iptv-modal {\
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;\
  background: rgba(0,0,0,0.85); z-index: 999;\
  display: flex; align-items: center; justify-content: center;\
}\
.iptv-modal-inner {\
  background: #1e1e1e; border-radius: 12px; padding: 24px;\
  width: 90%; max-width: 520px; max-height: 80%; overflow-y: auto;\
}\
.iptv-modal-inner h2 {\
  margin: 0 0 16px; font-size: 20px;\
}\
.iptv-modal-inner label {\
  display: block; font-size: 12px; color: #999; margin: 12px 0 4px;\
}\
.iptv-modal-inner input,\
.iptv-modal-inner textarea {\
  width: 100%; padding: 10px 12px; border: 1px solid #333;\
  border-radius: 6px; background: #111; color: #fff;\
  font-size: 14px; box-sizing: border-box;\
}\
.iptv-modal-inner textarea {\
  min-height: 80px; resize: vertical;\
}\
.iptv-modal-inner .iptv-btns {\
  display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end;\
}\
.iptv-playlist-item {\
  display: flex; align-items: center; gap: 8px;\
  padding: 8px 0; border-bottom: 1px solid #2a2a2a;\
}\
.iptv-playlist-item .name { flex: 1; font-size: 14px; }\
.iptv-playlist-item .del {\
  background: none; border: none; color: #e50914; font-size: 18px;\
  cursor: pointer; padding: 4px;\
}\
.iptv-loading {\
  flex: 1; display: flex; align-items: center; justify-content: center;\
  flex-direction: column; gap: 16px; color: #666;\
}\
.iptv-spinner {\
  width: 40px; height: 40px; border: 3px solid #2a2a2a;\
  border-top-color: #e50914; border-radius: 50%;\
  animation: iptv-spin 0.8s linear infinite;\
}\
@keyframes iptv-spin { to { transform: rotate(360deg); } }\
@media (max-width: 800px) {\
  .iptv-card { width: calc(25% - 10px); min-width: 100px; }\
}\
@media (max-width: 500px) {\
  .iptv-card { width: calc(33.33% - 10px); min-width: 90px; }\
}\
.iptv-epg-row {\
  display: flex; gap: 8px; padding: 6px 0;\
  border-bottom: 1px solid #222; font-size: 13px;\
}\
.iptv-epg-time {\
  color: #888; flex-shrink: 0; width: 100px;\
}\
.iptv-epg-now {\
  color: #e50914; font-weight: 700;\
}\
.iptv-epg-title {\
  flex: 1;\
}\
.iptv-epg-desc {\
  font-size: 11px; color: #666; margin-top: 2px;\
}\
.iptv-public-list {\
  max-height: 400px; overflow-y: auto;\
}\
.iptv-public-item {\
  display: flex; align-items: center; gap: 12px;\
  padding: 10px 0; border-bottom: 1px solid #2a2a2a;\
}\
.iptv-public-info { flex: 1; }\
.iptv-public-name { font-size: 14px; font-weight: 500; }\
.iptv-public-desc { font-size: 11px; color: #666; margin-top: 2px; }\
.iptv-public-add { flex-shrink: 0; }\
.iptv-public-add.active { background: #1a5a2a; }'

  function openSettings(component) {
    var data = loadData()
    var html = '<div class="iptv-modal">\
<div class="iptv-modal-inner">\
<h2>IPTV Settings</h2>\
<label>Playlist URL (M3U / M3U8)</label>\
<input class="iptv-input-url" type="text" placeholder="https://example.com/playlist.m3u" />\
<div class="iptv-btns"><button class="iptv-btn iptv-add-url">Add URL</button></div>\
<div class="iptv-btns" style="margin-top:16px"><button class="iptv-btn iptv-open-public" style="flex:1;background:#1a5a2a">🌐 Public playlists</button></div>\
<label>Or paste M3U content</label>\
<textarea class="iptv-input-content" placeholder="Paste M3U playlist content here..."></textarea>\
<div class="iptv-btns"><button class="iptv-btn iptv-add-content">Add from text</button></div>\
<label>EPG URL (XMLTV)</label>\
<input class="iptv-input-epg" type="text" placeholder="https://example.com/epg.xml" value="' + (data.epg_url || '') + '" />\
<div class="iptv-btns"><button class="iptv-btn iptv-save-epg">Save EPG URL</button></div>\
<label>Loaded playlists</label>\
<div class="iptv-playlist-list">'

    for (var i = 0; i < data.playlists.length; i++) {
      var p = data.playlists[i]
      html += '<div class="iptv-playlist-item">\
<span class="name">' + (p.name || 'Unnamed') + ' <span style="color:#666;font-size:11px">(' + (p.channels || 0) + ' channels)</span></span>\
<button class="del" data-idx="' + i + '">✕</button></div>'
    }

    html += '</div>\
<div class="iptv-btns">\
<button class="iptv-btn iptv-close-settings">Close</button>\
</div>\
</div></div>'

    var modal = $(html)
    $('body').append(modal)

    modal.find('.iptv-add-url').on('click', function () {
      var val = modal.find('.iptv-input-url').val().trim()
      if (!val) return
      addPlaylistUrl(val, null, null, function () {
        modal.remove()
        if (component) component.start()
      })
    })

    modal.find('.iptv-open-public').on('click', function () {
      modal.remove()
      openPublicBrowser(component)
    })

    modal.find('.iptv-add-content').on('click', function () {
      var val = modal.find('.iptv-input-content').val().trim()
      if (!val) return
      addPlaylistContent(val, function () {
        modal.remove()
        if (component) component.start()
      })
    })

    modal.find('.iptv-save-epg').on('click', function () {
      var val = modal.find('.iptv-input-epg').val().trim()
      var d = loadData()
      d.epg_url = val
      saveData(d)
      Lampa.Noty.show('EPG URL saved')
      modal.remove()
      if (component) component.start()
    })

    modal.find('.iptv-close-settings').on('click', function () {
      modal.remove()
      if (component) component.start()
    })

    modal.find('.del').on('click', function () {
      var idx = parseInt($(this).attr('data-idx'))
      var d = loadData()
      d.playlists.splice(idx, 1)
      saveData(d)
      modal.remove()
      if (component) component.start()
    })
  }

  function addPlaylistContent(content, callback) {
    var channels = parseM3U(content)
    var data = loadData()
    data.playlists.push({
      id: uid(),
      name: 'Pasted playlist ' + (data.playlists.length + 1),
      content: content,
      channels: channels.length
    })
    saveData(data)
    Lampa.Noty.show('Loaded ' + channels.length + ' channels')
    if (callback) callback()
  }

  function fetchEPG(data, callback) {
    if (!data.epg_url) { if (callback) callback({}); return }
    var xhr = new XMLHttpRequest()
    xhr.open('GET', data.epg_url, true)
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        var epg = parseEPG(xhr.responseText)
        if (callback) callback(epg)
      } else {
        if (callback) callback({})
      }
    }
    xhr.onerror = function () {
      if (callback) callback({})
    }
    xhr.send()
  }

  function loadAllChannelsAsync(data, callback) {
    var all = []
    var pending = 0

    function done() {
      callback(all)
    }

    for (var i = 0; i < data.playlists.length; i++) {
      var p = data.playlists[i]

      if (p.content) {
        var chs = parseM3U(p.content)
        for (var j = 0; j < chs.length; j++) { chs[j]._playlistId = p.id }
        all = all.concat(chs)
      } else if (p.url) {
        pending++
        ;(function (pl) {
          var xhr = new XMLHttpRequest()
          xhr.open('GET', pl.url, true)
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
              var chs = parseM3U(xhr.responseText)
              for (var j = 0; j < chs.length; j++) { chs[j]._playlistId = pl.id }
              all = all.concat(chs)
            }
            pending--
            if (pending === 0) done()
          }
          xhr.onerror = function () {
            pending--
            if (pending === 0) done()
          }
          xhr.send()
        })(p)
      }
    }

    if (pending === 0) done()
  }

  function getCategories(channels) {
    var cats = ['All']
    var seen = {}
    for (var i = 0; i < channels.length; i++) {
      var g = channels[i].group || 'Other'
      if (!seen[g]) { seen[g] = true; cats.push(g) }
    }
    return cats
  }

  var IPTVComponent = function () {
    var self = this
    var data = { playlists: [], epg_url: '', favorites: [] }
    var allChannels = []
    var filtered = []
    var currentCat = 'All'
    var epgData = {}
    var container

    this.create = function () {
      container = $(
        '<div class="iptv-main">' +
        '<div class="iptv-topbar">' +
        '<div class="iptv-title">📺 IPTV</div>' +
        '<button class="iptv-btn iptv-btn-public">🌐 Public</button>' +
        '<button class="iptv-btn iptv-btn-settings">⚙️ Settings</button>' +
        '</div>' +
        '<div class="iptv-bar iptv-cat-bar"></div>' +
        '<div class="iptv-grid"></div>' +
        '</div>'
      )

      container.find('.iptv-btn-public').on('click', function () {
        openPublicBrowser(self)
      })

      container.find('.iptv-btn-settings').on('click', function () {
        openSettings(self)
      })

      return container
    }

    this.start = function () {
      data = loadData()
      var grid = container.find('.iptv-grid')
      grid.html('<div class="iptv-loading"><div class="iptv-spinner"></div><span>Loading channels...</span></div>')

      if (data.playlists.length === 0) {
        grid.html(
          '<div class="iptv-empty">' +
          '<span>No playlists added yet</span>' +
          '<button class="iptv-btn iptv-btn-start-public" style="background:#1a5a2a">🌐 Browse public playlists</button>' +
          '<button class="iptv-btn iptv-btn-settings-start">⚙️ Add custom URL</button>' +
          '</div>'
        )
        grid.find('.iptv-btn-start-public').on('click', function () {
          openPublicBrowser(self)
        })
        grid.find('.iptv-btn-settings-start').on('click', function () {
          openSettings(self)
        })
        container.find('.iptv-cat-bar').html('')
        return
      }

      loadAllChannelsAsync(data, function (channels) {
        allChannels = channels || []

        if (allChannels.length === 0) {
          grid.html(
            '<div class="iptv-empty">' +
            '<span>No channels found in playlists</span>' +
            '<button class="iptv-btn iptv-btn-start-public" style="background:#1a5a2a">🌐 Browse public playlists</button>' +
            '<button class="iptv-btn iptv-btn-settings-start">⚙️ Settings</button>' +
            '</div>'
          )
          grid.find('.iptv-btn-start-public').on('click', function () {
            openPublicBrowser(self)
          })
          grid.find('.iptv-btn-settings-start').on('click', function () {
            openSettings(self)
          })
          container.find('.iptv-cat-bar').html('')
          return
        }

        var cats = getCategories(allChannels)
        renderCats(cats)

        fetchEPG(data, function (epg) {
          epgData = epg || {}
          filterChannels(currentCat)
        })
      })
    }

    function renderCats(cats) {
      var bar = container.find('.iptv-cat-bar')
      bar.html('')
      for (var i = 0; i < cats.length; i++) {
        (function (cat) {
          var btn = $('<span class="iptv-cat' + (cat === currentCat ? ' sel' : '') + '">' + cat + '</span>')
          btn.on('click', function () {
            currentCat = cat
            bar.find('.iptv-cat').removeClass('sel')
            btn.addClass('sel')
            filterChannels(cat)
          })
          bar.append(btn)
        })(cats[i])
      }
    }

    function filterChannels(cat) {
      filtered = cat === 'All' ? allChannels.slice() : allChannels.filter(function (c) { return (c.group || 'Other') === cat })
      renderGrid()
    }

    function renderGrid() {
      var grid = container.find('.iptv-grid')
      grid.html('')

      if (filtered.length === 0) {
        grid.html('<div class="iptv-empty"><span>No channels in this category</span></div>')
        return
      }

      for (var i = 0; i < filtered.length; i++) {
        (function (ch, idx) {
          var isFav = data.favorites.indexOf(ch.id) !== -1
          var now = getCurrentProgram((epgData[ch.tvg_id || ch.id] || {}).data)

          var card = $(
            '<div class="iptv-card" tabindex="0">' +
            '<div class="iptv-card-logo">' +
            (ch.logo ? '<img src="' + ch.logo + '" loading="lazy" onerror="this.style.display=\'none\'" />' : '') +
            '</div>' +
            (now ? '<div class="iptv-card-now">' + now.title + '</div>' : '') +
            '<div class="iptv-card-name">' + ch.name + '</div>' +
            '<div class="iptv-card-fav' + (isFav ? ' on' : '') + '">' + (isFav ? '★' : '☆') + '</div>' +
            '</div>'
          )

          card.on('click', function () {
            playChannel(ch, idx)
          })

          card.on('hover:enter', function () {
            card.focus()
          })

          card.find('.iptv-card-fav').on('click', function (e) {
            e.stopPropagation()
            e.preventDefault()
            toggleFav(ch, card.find('.iptv-card-fav'))
          })

          grid.append(card)
        })(filtered[i], i)
      }
    }

    function playChannel(ch, idx) {
      var favs = data.favorites || []
      var allForNav = allChannels

      var playlist = []
      for (var i = 0; i < allForNav.length; i++) {
        playlist.push({
          title: allForNav[i].name,
          url: allForNav[i].url,
          poster: allForNav[i].logo,
          tv: true
        })
      }

      var epgProgs = (epgData[ch.tvg_id || ch.id] || {}).data || []
      var program = []
      for (var i = 0; i < epgProgs.length; i++) {
        program.push({
          title: epgProgs[i].title,
          desc: epgProgs[i].desc,
          start: epgProgs[i].start,
          stop: epgProgs[i].stop
        })
      }

      Lampa.Player.play({
        url: ch.url,
        title: ch.name,
        poster: ch.logo || '',
        tv: true,
        playlist: playlist,
        program: program,
        start_time: Math.floor(Date.now() / 1000)
      })
    }

    function toggleFav(ch, el) {
      data = loadData()
      var idx = data.favorites.indexOf(ch.id)
      if (idx === -1) {
        data.favorites.push(ch.id)
        el.html('★').addClass('on')
      } else {
        data.favorites.splice(idx, 1)
        el.html('☆').removeClass('on')
      }
      saveData(data)
    }

    this.destroy = function () {
      if (container) container.remove()
    }
  }

  function startPlugin() {
    try {
      var styleEl = document.createElement('style')
      styleEl.textContent = CSS
      document.head.appendChild(styleEl)
    } catch (e) {}

    try { Lampa.Component.add('iptv', IPTVComponent) } catch (e) {}

    function openIPTV() {
      try {
        Lampa.Activity.push({ url: '', title: 'IPTV', component: 'iptv' })
      } catch (e) {}
    }

    function tryRegisterMenu() {
      var apis = [
        function () {
          if (Lampa.Activity && typeof Lampa.Activity.add === 'function') {
            Lampa.Activity.add({ component: 'iptv', title: 'IPTV', menu: true })
            return true
          }
        },
        function () {
          if (Lampa.Plugins && typeof Lampa.Plugins.add === 'function') {
            Lampa.Plugins.add({ title: '📺 IPTV', component: 'iptv', url: '' })
            return true
          }
        },
        function () {
          if (Lampa.Plugins && typeof Lampa.Plugins.install === 'function') {
            Lampa.Plugins.install({ title: '📺 IPTV', component: 'iptv', url: '', icon: 'tv' })
            return true
          }
        },
        function () {
          if (Lampa.Sidebar && typeof Lampa.Sidebar.add === 'function') {
            Lampa.Sidebar.add({ title: '📺 IPTV', component: 'iptv', url: '' })
            return true
          }
        },
        function () {
          if (Lampa.Menu && typeof Lampa.Menu.add === 'function') {
            Lampa.Menu.add({ title: '📺 IPTV', component: 'iptv', url: '' })
            return true
          }
        },
        function () {
          if (Lampa.Menu && typeof Lampa.Menu.add === 'function') {
            Lampa.Menu.add('📺 IPTV', openIPTV)
            return true
          }
        },
        function () {
          if (Lampa.Menu && typeof Lampa.Menu.item === 'function') {
            Lampa.Menu.item({ title: '📺 IPTV', component: 'iptv', url: '' })
            return true
          }
        },
        function () {
          if (Lampa.Menu && typeof Lampa.Menu.push === 'function') {
            Lampa.Menu.push({ title: '📺 IPTV', component: 'iptv', url: '' })
            return true
          }
        },
        function () {
          if (Lampa.Navigator && typeof Lampa.Navigator.add === 'function') {
            Lampa.Navigator.add({ title: '📺 IPTV', component: 'iptv' })
            return true
          }
        },
        function () {
          if (Lampa.Bookmark && typeof Lampa.Bookmark.add === 'function') {
            Lampa.Bookmark.add({ title: '📺 IPTV', url: '', component: 'iptv' })
            return true
          }
        },
        function () {
          if (Lampa.Extension && typeof Lampa.Extension.add === 'function') {
            Lampa.Extension.add({ name: 'iptv', title: '📺 IPTV', component: 'iptv' })
            return true
          }
        }
      ]

      for (var i = 0; i < apis.length; i++) {
        try {
          if (apis[i]()) return true
        } catch (e) {}
      }
      return false
    }

    if (!tryRegisterMenu()) {
      Lampa.Listener.follow('full', function (event) {
        if (event.type === 'complite') {
          tryRegisterMenu()
        }
      })
    }

    try { Lampa.Lang.add({ iptv_title: 'IPTV', iptv_settings: 'Settings', iptv_fav: 'Favorites' }) } catch (e) {}
  }

  if (window.Lampa && Lampa.Listener) {
    startPlugin()
  } else {
    var checkLampa = setInterval(function () {
      if (window.Lampa && Lampa.Listener) {
        clearInterval(checkLampa)
        startPlugin()
      }
    }, 100)
  }
})()
