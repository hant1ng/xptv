//  cheerio 实例创建 (假设已存在)
const cheerio = createCheerio()

// 伪装的浏览器 User-Agent
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1'

// ------------------- 基础配置 -------------------
// 目标网站: rou.video
let appConfig = {
    ver: 1,
    title: 'Rou Video', // 可自定义
    site: 'https://rou.video',
}

// ------------------- 核心函数 -------------------

/**
 * 获取应用配置和分类
 */
async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

/**
 * 获取所有分类标签
 */
async function getTabs() {
    let list = [];
    let ignore = []; 
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element));
    }

    let classurl = `${appConfig.site}/home`;

    const { data } = await $fetch.get(classurl, {
        headers: {
            'User-Agent': UA,
        },
    });
    const $ = cheerio.load(data);

    // 选择器，选中主页内容容器里的所有 a 标签
    let allClass = $('.space-y-8 a'); 
    allClass.each((_, e) => {
        const name = $(e).text().trim();
        const href = $(e).attr('href');
        const isIgnore = isIgnoreClassName(name);
        
        if (!href || !name || isIgnore) return;

        list.push({
            name,
            ext: {
                typeurl: href,
            },
            ui: 1,
        });
    });

    return list;
}

/**
 * 获取指定分类下的视频列表
 */
async function getCards(ext) {
    ext = argsify(ext);
    let cards = [];
    let { page = 1, typeurl } = ext;

    // 根据分页规则拼接 URL
    let url = `${appConfig.site}${typeurl}?page=${page}`;

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);

    // 主选择器，选中页面上每一个视频卡片
    $('.group').each((_, element) => {
        const linkElement = $(element).find('h3').closest('a');
        const href = linkElement.attr('href');

        if (!href) return;
        
        const title = linkElement.find('h3').text().trim();
        const cover = $(element).find('img.relative').attr('src');
        const duration = $(element).find('.absolute.bottom-1.left-1').text().trim();

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_duration: duration,
            ext: {
                url: `${appConfig.site}${href}`, 
            },
        });
    });

    return jsonify({
        list: cards,
    });
}

/**
 * 获取视频的播放地址 (m3u8)
 */
async function getTracks(ext) {
    ext = argsify(ext);
    let tracks = [];
    const url = ext.url;

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);
    
    // 直接选择那个包含所有数据的 JSON 块
    const jsonData = $('#__NEXT_DATA__').text();
    const pageData = JSON.parse(jsonData);

    // 从解析后的数据中获取视频 ID
    const videoId = pageData.props.pageProps.video.id;

    // 尝试拼接出基础的 m3u8 链接 (注意：可能因缺少签名而无法播放)
    const playUrl = `https://v.rn179.xyz/hls/${videoId}/index.m3u8`;

    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: playUrl,
        },
    });

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
            },
        ],
    });
}

/**
 * 最终播放信息处理
 */
async function getPlayinfo(ext) {
    ext = argsify(ext);
    const url = ext.url;

    return jsonify({ urls: [url] });
}

/**
 * 搜索功能
 */
async function search(ext) {
    ext = argsify(ext);
    let cards = [];
    let text = encodeURIComponent(ext.text);
    let page = ext.page || 1;

    // 注意：这里的搜索 URL 是根据常见结构猜测的，可能需要根据实际情况调整
    let url = `${appConfig.site}/search?q=${text}&page=${page}`;

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    });

    const $ = cheerio.load(data);

    // 搜索结果页的卡片结构和分类页相同，直接复用 getCards 的逻辑
    $('.group').each((_, element) => {
        const linkElement = $(element).find('h3').closest('a');
        const href = linkElement.attr('href');

        if (!href) return;
        
        const title = linkElement.find('h3').text().trim();
        const cover = $(element).find('img.relative').attr('src');
        const duration = $(element).find('.absolute.bottom-1.left-1').text().trim();

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_duration: duration,
            ext: {
                url: `${appConfig.site}${href}`, 
            },
        });
    });

    return jsonify({
        list: cards,
    });
}
