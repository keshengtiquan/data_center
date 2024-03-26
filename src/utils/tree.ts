/**
 * @description 构造树型结构数据
 * @param data 数据源
 * @param id id字段 默认id
 * @param parentId 父节点字段，默认parentId
 * @param children 子节点字段，默认children
 * @returns 追加字段后的树
 */
export const handleTree = (
  data: any[],
  id?: string,
  parentId?: string,
  children?: string,
): any => {
  if (!Array.isArray(data)) {
    console.warn('data must be an array');
    return [];
  }
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  function adaptToChildrenList(o: Record<string, any>) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  }
  return tree;
};

/**
 * @description 提取菜单树中的每一项uniqueId
 * @param tree 树
 * @returns 每一项uniqueId组成的数组
 */
export const extractPathList = (tree: any[], uniqueId: string): any => {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const expandedPaths: Array<number | string> = [];
  for (const node of tree) {
    const hasChildren = node.children && node.children.length > 0;
    if (hasChildren) {
      extractPathList(node.children, uniqueId);
    }
    expandedPaths.push(node[uniqueId]);
  }
  return expandedPaths;
};

/**
 * @description 提取菜单树中的每一项uniqueId
 * @param tree 树
 * @returns 每一项uniqueId组成的数组
 */
export const extractSubNodeList = (
  tree: any[],
  nodeId: number,
  uniqueId?: string,
): any => {
  if (!Array.isArray(tree)) {
    console.warn('tree must be an array');
    return [];
  }
  if (!tree || tree.length === 0) return [];
  const config = {
    uniqueId: uniqueId || 'id',
  };
  const expandedPaths: Array<number | string> = [];
  function extractNode(node) {
    expandedPaths.push(node[config.uniqueId]);
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        extractNode(child);
      });
    }
  }

  function findNode(tree, nodeId) {
    for (const node of tree) {
      if (node[config.uniqueId] === nodeId) {
        extractNode(node);
        break;
      } else if (node.children && node.children.length > 0) {
        findNode(node.children, nodeId);
      }
    }
  }
  findNode(tree, nodeId);
  return expandedPaths;
};
