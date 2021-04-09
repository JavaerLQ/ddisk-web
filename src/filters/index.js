// 存储容量格式化
const storageTrans = (size, status) => {
	const B = 1024
	const KB = Math.pow(1024, 2)
	const MB = Math.pow(1024, 3)
	const GB = Math.pow(1024, 4)
	if(status) {	//	截取整数部分
		if (!size) {
			return  0 + 'KB'
		} else if (size < KB) {
			return  (size / B).toFixed(0) + 'KB'
		} else if (size < MB) {
			return  (size / KB).toFixed(0) + 'MB'
		} else if (size < GB) {
			return  (size / MB).toFixed(0) + 'GB'
		} else {
			return  (size / GB).toFixed(0) + 'TB'
		}
	} else {
		if (!size) {
			return  0 + 'KB'
		} else if (size < KB) {
			return  (size / B).toFixed(0) + 'KB'
		} else if (size < MB) {
			return  (size / KB).toFixed(2) + 'MB'
		} else if (size < GB) {
			return  (size / MB).toFixed(3) + 'GB'
		} else {
			return  (size / GB).toFixed(4) + 'TB'
		}
	}
}
const filenameComplete = (item) => {
	return item.filename + (!item.isDir && item.extension !== null ? `.${item.extension}` : '')
}

// 分离文件名和文件扩展名
const filenameSplit = (name) => {
	let index = name.lastIndexOf('.')
	let filename = name.substr(0, index)
	let extension = name.substring(index+1)
	return {
		filename,extension
	}
}


export {
	storageTrans,
	filenameComplete,
	filenameSplit,
}
