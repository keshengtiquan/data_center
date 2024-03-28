import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, mergeMap, tap } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { formatDate } from 'src/utils/data';

@Injectable()
export class UtcToLocalInterceptor implements NestInterceptor {
  @Inject(PrismaService)
  private prisma: PrismaService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      mergeMap(async (data) => {
        if (data.data.results) {
          if (data.data.results.length > 0) {
            const updatedData = await this.processData(data.data.results);
            data.data.results = updatedData;
            return data;
          } else {
            return data;
          }
        } else {
          const updatedData = await this.processData(data.data);
          data.data = updatedData;
          return data;
        }
      }),
      tap((data) => {
        if (data.data.results) {
          if (data.data.results.length > 0) {
            data.data.results = this.utc2local(data.data.results);
          } else {
            return data;
          }
        } else {
          data.data = this.utc2local(data.data);
        }
      }),
    );
  }

  private utc2local(data: any[]) {
    return data.map((item) => {
      const { createTime, updateTime, ...fields } = item;
      const obj = {
        createTime: formatDate(createTime, 'YYYY-MM-DD HH:mm:ss'),
        updateTime: formatDate(updateTime, 'YYYY-MM-DD HH:mm:ss'),
        ...fields,
      };
      if (item.children && item.children.length > 0) {
        obj.children = this.utc2local(item.children);
      }
      return obj;
    });
  }

  private async processData(data: any[]) {
    const userNameSet = new Set<string>();
    const userList = [];
    // 遍历树形结构中的所有节点，构建用户名集合
    const traverseAndCollectUsernames = (node) => {
      if (node.createBy && node.createBy !== 'system')
        userNameSet.add(node.createBy);
      if (node.updateBy && node.createBy !== 'system')
        userNameSet.add(node.updateBy);
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => traverseAndCollectUsernames(child));
      }
    };
    data.forEach(traverseAndCollectUsernames);

    // 通过用户名集合查询用户信息
    const userNameList: string[] = Array.from(userNameSet);
    if (userNameList.length > 0) {
      userList.push(
        ...(await this.prisma.user.findMany({
          where: { userName: { in: userNameList } },
        })),
      );
    }
    // 更新数据中的用户名字段
    const updateNodeUsernames = (node) => {
      if (node.createBy) {
        const user = userList.find((user) => user.userName === node.createBy);
        if (user) {
          node.createBy = user.nickName;
        }
      }
      if (node.updateBy) {
        const user = userList.find((user) => user.userName === node.updateBy);
        if (user) {
          node.updateBy = user.nickName;
        }
      }
      if (node.children && node.children.length > 0) {
        node.children = node.children.map(updateNodeUsernames);
      }
      return node;
    };

    return data.map(updateNodeUsernames);
  }
}
