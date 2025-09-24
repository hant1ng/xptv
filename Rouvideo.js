// 最后的终极手段 v5 (记忆功能 + 兼容语法)
var cheerio = createCheerio()

var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

var appConfig = {
    ver: 1,
    title: '肉视频 (终极版)',
    site: 'https://rou.video',
}

// 1. 恢复“记忆”功能: 使用全局变量来记住分类
var currentCategoryUrl = '';

async function getConfig() {
    var config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

async function getTabs() {
    var list = []
    var { data } = await $fetch.get(`${appConfig.site}/home`, {
        headers: { 'User-Agent': UA },
    })
    var $ = cheerio.load(data)

    $('.space-y-8 a').each((_, e) => {
        var name = $(e).text().trim()
        var href = $(e).attr('href')
        if (href && name) {
            list.push({
                name,
                ui: 1,
                ext: {
                    url: href,
                },
            })
        }
    })
    return list
}

async function getCards(ext) {
    ext = argsify(ext);
    
    // 2. 使用“记忆”功能处理翻页
    if (ext.url) {
        currentCategoryUrl = ext.url;
    }

    var page = ext.page || 1;

    if (!currentCategoryUrl) {
        return jsonify({ list: [] });
    }

    var url = `${appConfig.site}${currentCategoryUrl}?page=${page}`;
    
    var cards = [];
    var { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    var $ = cheerio.load(data)

    $('.group').each((_, element) => {
        var linkElement = $(element).find('h3').closest('a')
        var href = linkElement.attr('href')

        if (!href) return
        
        var title = linkElement.find('h3').text().trim()
        var cover = $(element).find('img.relative').attr('src')
        var duration = $(element).find('.absolute.bottom-1.left-1').text().trim()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: duration,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    var tracks = []
    var url = ext.url

    var { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    var $ = cheerio.load(data)
    
    var jsonData = $('#__NEXT_DATA__').text()
    var pageData = JSON.parse(jsonData)

    var videoId = pageData.props.pageProps.video.id

    var playUrl = `https://v.rn179.xyz/hls/${videoId}/index.m3u8`

    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: playUrl,
        },
    })

    return jsonify({
        list: [{ title: '默认分组', tracks }],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    var url = ext.url
    return jsonify({ urls: [url] })
}

async function search(ext) {
    ext = argsify(ext)
    var cards = []
    var text = encodeURIComponent(ext.text)
    var page = ext.page || 1
    var url = `${appConfig.site}/search?q=${text}&page=${page}`

    var { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    var $ = cheerio.load(data)

    $('.group').each((_, element) => {
        var linkElement = $(element).find('h3').closest('a')
        var href = linkElement.attr('href')

        if (!href) return

        var title = linkElement.find('h3').text().trim()
        var cover = $(element).find('img.relative').attr('src')
        var duration = $(element).find('.absolute.bottom-1.left-1').text().trim()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: duration,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}
