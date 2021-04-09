//  文件模块接口
import { get,post } from './http'

/**
 * 查询文件相关api
 */
//获取文件的树结构
export const getFileTree = p => get('/file/dir/tree', p);
// 获取回收站文件列表
export const getRecoveryFile = p => get('/file/list/recycle', p);
// 获取路径树字典
export const getPathTreeMap = p => get('/file/path/tree', p)
// 通过文件类型选择文件
export const selectFileByFileType = p => get('/file/list/type', p);
// 搜索文件
export const searchFile = p => get('/file/search', p)
// 获取当前目录下的所有文件
export const getFileList = p => get('/file/list', p);
/**
 * 文件上传下载
 */
// 合并切片
export const mergeFile = p => post('/transfer/merge', p);
// 下载文件
export const downloadFile = p => get("/transfer/download/"+p);
// 获取略缩图
export const getThumbnail = p => get('/transfer/thumbnail/' + p);

/**
 * 创建文件
 */
// 创建文件夹
export const makeDir = p => post('/file/mkdir', p, true);
// 恢复回收站文件
export const recoverRecycleFile = p => post('/file/recover', p, true)
// 恢复回收站文件
export const batchRecoverRecycle = p => post('/file/batch/recover', p, true)


/**
 * 删除文件
 */
//删除文件
export const deleteFile = p => post('/file/delete', p, true);
// 回收站文件删除
export const deleteRecoveryFile = p => post('/file/delete/recycle', p, true);
// 批量删除回收站文件
export const batchDeleteRecoveryFile = p => post('/file/batch/delete/recycle', p, true)
//批量删除文件
export const batchDeleteFile = p => post('/file/batch/delete', p, true);

/**其他*/
//移动文件
export const moveFile = p => post('/file/move', p, true);
//批量移动文件
export const batchMoveFile = p => post('/file/batch/move', p, true);
//获取存储占用
export const getStorage = p => get('/user/storage/info', p);
//重命名文件
export const renameFile = p => post('/file/rename', p, true);

/**未实现*/
export const unzipfile = p => post('/file/unzip', p); //解压文件





