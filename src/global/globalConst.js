import Vue from 'vue'
/**
 * 全局常量
 */
export const SYSTEM_NAME = "丢丢网盘"
// 切片最大大小
export const CHUNK_SIZE = 1024 * 1024;
// 文件根目录ID
export const ROOT_PATH = null;
// 文件类型
export const FILE_TYPE = {
    // 不区分文件类型，默认所有类型
    ALL: "ALL",
    // 图片文件类型
    IMAGE: "IMAGE",
    // 文档文件类型
    DOC: "DOC",
    // 视频文件类型
    VIDEO: "VIDEO",
    // 音乐文件类型
    MUSIC: "MUSIC",
    // 软件包类型
    APP: "APP",
    // 其他文件类型
    OTHER: "OTHER",
    // 共享文件类型
    SHARE: "SHARE",
    // 回收站文件类型
    RECYCLE: "RECYCLE",
}

// 操作类型，折叠，展开
export const FOLD_TYPE = {
    // 展开
    UNFOLD: true,
    // 折叠
    FOLD: false,
}

// 文件类型对应的中文解释
export const FILE_TYPE_MAP = {
    "ALL": '全部文件',
    "IMAGE": '全部图片',
    "DOC": '全部文档',
    "VIDEO": '全部视频',
    "MUSIC": '全部音乐',
    "APP": '全部应用',
    "OTHER": '其他',
    "SHARE": '共享文件',
    "RECYCLE": '回收站'
}

// 文件展示模式
export const FILE_MODEL = {
    // 列表
    TABLE: 0,
    // 网格
    GRID: 1,
    // 时间线
    TIME_LINE: 2
}

// 可识别的图片类型
export const IMG_TYPE_LIST = ["bmp", "jpg", "png", "tif", "gif", "jpeg"]
export const VIDEO_TYPE_LIST = ["avi", "mp4", "mpg", "mov", "swf", "flv"]
export const MUSIC_TYPE_LIST = ["wav", "aif", "au", "mp3", "ram", "wma", "mmf", "amr", "aac", "flac"]

//  可以识别的文件类型
export const FILE_IMG_TYPE_LIST = [
    'png',
    'jpg',
    'jpeg',
    'docx',
    'doc',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'avi',
    'mp4',
    'css',
    'csv',
    'chm',
    'rar',
    'zip',
    'dmg',
    'mp3',
    'flac',
    'open',
    'pdf',
    'rtf',
    'txt',
    'oa',
    'js',
    'html',
    'img',
    'sql',
    'jar',
    'svg',
    'gif',
    'json',
    'exe',
    'md'
];
//  文件图片Map映射
export const FILE_IMG_MAP = {
    dir: require('@/assets/images/file/dir.png'),
    chm: require('@/assets/images/file/file_chm.png'),
    css: require('@/assets/images/file/file_css.png'),
    csv: require('@/assets/images/file/file_csv.png'),
    png: require('@/assets/images/file/file_pic.png'),
    jpg: require('@/assets/images/file/file_pic.png'),
    jpeg: require('@/assets/images/file/file_pic.png'),
    docx: require('@/assets/images/file/file_word.png'),
    doc: require('@/assets/images/file/file_word.png'),
    ppt: require('@/assets/images/file/file_ppt.png'),
    pptx: require('@/assets/images/file/file_ppt.png'),
    xls: require('@/assets/images/file/file_excel.png'),
    xlsx: require('@/assets/images/file/file_excel.png'),
    mp4: require('@/assets/images/file/file_video.png'),
    avi: require('@/assets/images/file/file_avi.png'),
    rar: require('@/assets/images/file/file_rar.png'),
    zip: require('@/assets/images/file/file_zip.png'),
    dmg: require('@/assets/images/file/file_dmg.png'),
    mp3: require('@/assets/images/file/file_music.png'),
    flac: require('@/assets/images/file/file_music.png'),
    open: require('@/assets/images/file/file_open.png'),
    pdf: require('@/assets/images/file/file_pdf.png'),
    rtf: require('@/assets/images/file/file_rtf.png'),
    txt: require('@/assets/images/file/file_txt.png'),
    oa: require('@/assets/images/file/file_oa.png'),
    md: require('@/assets/images/file/file_md.png'),
    unknown: require('@/assets/images/file/file_unknown.png'),
    js: require('@/assets/images/file/file_js.png'),
    html: require('@/assets/images/file/file_html.png'),
    img: require('@/assets/images/file/file_img.png'),
    sql: require('@/assets/images/file/file_sql.png'),
    jar: require('@/assets/images/file/file_jar.png'),
    svg: require('@/assets/images/file/file_svg.png'),
    gif: require('@/assets/images/file/file_gif.png'),
    json: require('@/assets/images/file/file_json.png'),
    exe: require('@/assets/images/file/file_exe.png')
};

export default {
    install(){
        Vue.prototype.SYSTEM_NAME = SYSTEM_NAME
        // 文件类型
        Vue.prototype.FILE_TYPE = FILE_TYPE;
        // 根目录ID
        Vue.prototype.ROOT_PATH = ROOT_PATH;
        // 文件类型对应的中文解释
        Vue.prototype.FILE_TYPE_MAP = FILE_TYPE_MAP;
        // 文件操作，折叠或展开
        Vue.prototype.FOLD_TYPE = FOLD_TYPE;
        // 文件展示模式
        Vue.prototype.FILE_MODEL = FILE_MODEL;
        Vue.prototype.FILE_IMG_TYPE_LIST = FILE_IMG_TYPE_LIST;
        Vue.prototype.FILE_IMG_MAP = FILE_IMG_MAP;
        Vue.prototype.CHUNK_SIZE = CHUNK_SIZE;
        Vue.prototype.IMG_TYPE_LIST = IMG_TYPE_LIST;
        Vue.prototype.VIDEO_TYPE_LIST = VIDEO_TYPE_LIST
        Vue.prototype.MUSIC_TYPE_LIST = MUSIC_TYPE_LIST
    }
}
