import { Inject, Injectable } from '@nestjs/common';
import { FindLogListDto } from './dto/find-log-list.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
import * as dayjs from 'dayjs';

@Injectable()
export class LogService {
  @Inject()
  private prisma: PrismaService;
  @Inject(ClsService)
  private readonly cls: ClsService;

  async getlist(findLogListDto: FindLogListDto) {
    const { current, pageSize, name, category } = findLogListDto;

    const condition = {
      ...(name && { name: { contains: name } }),
      ...(category && { category: category }),
    };

    const list = await this.prisma.log.findMany({
      where: condition,
      take: pageSize,
      skip: (current - 1) * pageSize,
      orderBy: { opTime: 'desc' },
    });
    console.log(list[0].id);
    
    return {
      results: list,
      pageSize,
      current,
      total: await this.prisma.log.count({ where: condition }),
    };
  }

  /**
   * 获取本周的数据
   */
  async getWeekChart() {
    const startWeekTime = dayjs(new Date()).subtract(7, 'day').format('YYYY-MM-DD') + ' 00:00:00';
    const endWeekTime = dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59:59';

    const list: any[] = await this.prisma.$queryRaw`SELECT
    DATE(op_time) AS date,
    'login' AS category,
    CAST(COUNT(*) AS UNSIGNED) AS count
    FROM
        dev_log
    WHERE
    op_time >= ${startWeekTime} AND op_time <= ${endWeekTime} AND category = 'login'
    GROUP BY
        DATE(op_time)
    UNION ALL
    SELECT
        DATE(op_time) AS date,
        'logout' AS category,
        CAST(COUNT(*) AS UNSIGNED) AS count
    FROM
        dev_log
    WHERE
        op_time >= ${startWeekTime} AND op_time <= ${endWeekTime} AND category = 'logout'
    GROUP BY
        DATE(op_time), category
    ORDER BY
    date, category`;

    return list.map((item) => {
      return {
        date: dayjs(item.date).format('YYYY-MM-DD'),
        category: item.category === 'login' ? '登录' : '登出',
        count: Number(item.count),
      };
    });
  }

  /**
   * 查询总占比
   */
  async getAllRatioChart(type: 'access' | 'operation') {
    const res: { category: string; count: any }[] = await this.prisma.$queryRaw`SELECT
      category,
      COUNT(*) AS count
    FROM dev_log
    GROUP BY category;`;
    const category = {
      login: '登录',
      logout: '登出',
      operate: '操作',
      exception: '异常',
    };
    if (type === 'access') {
      return res
        .filter((item) => item.category === 'login' || item.category === 'logout')
        .map((item) => {
          return {
            type: category[item.category],
            value: Number(item.count),
          };
        });
    } else if (type === 'operation') {
      return res
        .filter((item) => item.category === 'operate' || item.category === 'exception')
        .map((item) => {
          return {
            type: category[item.category],
            value: Number(item.count),
          };
        });
    }
  }

  /**
   * 获取详情
   * @param id
   */
  async getDetail(id: number) {
    return this.prisma.log.findUnique({
      where: { id },
    });
  }

  /**
   * 查询操作柱形图
   */
  async getColumnWeekChart() {
    const startWeekTime = dayjs(new Date()).subtract(7, 'day').format('YYYY-MM-DD') + ' 00:00:00';
    const endWeekTime = dayjs(new Date()).format('YYYY-MM-DD') + ' 23:59:59';
    const list: any[] = await this.prisma.$queryRaw`SELECT
    DATE(op_time) AS date,
    'exception' AS category,
    CAST(COUNT(*) AS UNSIGNED) AS count
    FROM
        dev_log
    WHERE
    op_time >= ${startWeekTime} AND op_time <= ${endWeekTime} AND category = 'exception'
    GROUP BY
        DATE(op_time)
    UNION ALL
    SELECT
        DATE(op_time) AS date,
        'operate' AS category,
        CAST(COUNT(*) AS UNSIGNED) AS count
    FROM
        dev_log
    WHERE
        op_time >= ${startWeekTime} AND op_time <= ${endWeekTime} AND category = 'operate'
    GROUP BY
        DATE(op_time), category
    ORDER BY
    date, category`;

    return list
      .map((item) => {
        return {
          date: dayjs(item.date).format('YYYY-MM-DD'),
          category: item.category === 'operate' ? '操作' : '异常',
          count: Number(item.count),
        };
      })
      .sort((a, b) => {
        if (a.category === '操作' && b.category === '异常') {
          return -1; // 将 '操作' 排在前面
        } else if (a.category === '异常' && b.category === '操作') {
          return 1; // 将 '异常' 排在后面
        } else {
          return 0; // 不改变顺序
        }
      });
  }
}
