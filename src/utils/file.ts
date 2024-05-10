export const extractFileType = (filename: string) => {
  // 使用正则表达式匹配文件名中的文件类型
  const fileTypeRegex = /\.([0-9a-z]+)(?:[\?#]|$)/i;
  const match = fileTypeRegex.exec(filename);

  if (match) {
    return match[1]; // 返回匹配到的文件类型
  } else {
    return "未知类型"; // 如果未匹配到则返回未知类型，你可以根据需要修改这里的返回值
  }
}