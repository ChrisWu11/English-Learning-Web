// 引入具体的文章文件
import dailyRoutine from './articles/01_daily_routine';
import grocery from './articles/02_grocery';

// 在这里控制文章的显示顺序
export const articles = [
  dailyRoutine,
  grocery,
  // 以后写了新文章，在这里 import 并加进去即可
];