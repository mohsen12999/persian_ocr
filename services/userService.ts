import { User } from '../types';

// A mock user database. In a real application, this would be an API call.
const mockUsers: User[] = [
  { id:55,	name: "فریدون حسین خواه"	},
  { id:54,	name: "حشمت نوروزی"	},
  { id:53,	name: "حسین رضایی"	},
  { id:52,	name: "مسعود لطفی"	},
  { id:51,	name: "یعقوب نظری"	},
  { id:50,	name: "محمد حسن عابدینی"	},
  { id:49,	name: "موسی قربانیان"	},
  { id:48,	name: "مهدی مسلمی"	},
  { id:47,	name: "سعید مشهدی"	},
  { id:46,	name: "حسین کلاهدوزی"	},
  { id:45,	name: "ناصر محمد پور"	},
  { id:44,	name: "مصطفی نوغا غمی"	},
  { id:43,	name: "مسعود مشهدی"	},
  { id:42,	name: "نادر رخده"	},
  { id:41,	name: "هادی میرفضلی"	},
  { id:40,	name: "ایرج علیپور"	},
  { id:39,	name: "مرتضی کارگر"	},
  { id:38,	name: "کاظم مهدوی"	},
  { id:37,	name: "محمد رضا ارجی"	},
  { id:36,	name: "عباس حسین پور"	},
  { id:35,	name: "مصطفی قرباندوست"	},
  { id:34,	name: "سجاد جانعلی پور"	},
  { id:33,	name: "هادی شیخیان"	},
  { id:32,	name: "منصور قربانی"	},
  { id:31,	name: "ابراهیم حسین خواه"	},
  { id:30,	name: "امین مسکین"	},
  { id:29,	name: "حسن حسینعلی پور"	},
  { id:28,	name: "محمد رمضانی"	},
  { id:27,	name: "مهران امیری"	},
  { id:26,	name: "محمود محمود خواه"	},
  { id:25,	name: "قاسم رحمن پور"	},
  { id:24,	name: "سجاد تاقلی"	},
  { id:23,	name: "مهدی پرژک"	},
  { id:22,	name: "محمد اسمعیل عباسی"	},
  { id:21,	name: "صیاد عباسی"	},
  { id:20,	name: "محمد حسین جهان دیده"	},
  { id:19,	name: "محمد تیاور"	},
  { id:18,	name: "محمد رضا مسلمی"	},
  { id:17,	name: "حسن مسلمی"	},
  { id:16,	name: "مختار جنت برجی"	},
  { id:15,	name: "میثم آشوبی"	},
  { id:14,	name: "عیسی بخشی پور"	},
  { id:13,	name: "احسان کوه پیما"	},
  { id:12,	name: "مصطفی محمد تابان"	},
  { id:11,	name: "حسین قربانی"	},
  { id:10,	name: "سجاد رمضان زاده"	},
  { id:9,	name: "مهران پور مهر"	},
  { id:8,	name: "ساسان افتخاری"	},
  { id:7,	name: "احمد فتوت"	},
  { id:6,	name: "اسحق باقر حسینی"	},
  { id:5,	name: "محمدرضا نوری دورانی مقدم"	},
  { id:4,	name: "ابراهیم حداد زاده"	},
  { id:3,	name: "اسماعیل ملک زاده"	},
  { id:2,	name: "ناصر مرادی"	},
  { id:1,	name: "غلام برتون" }
];

/**
 * Fetches a list of users.
 * @returns A promise that resolves to an array of User objects.
 */
export const fetchUsers = (): Promise<User[]> => {
  console.log('Fetching users from API...');
  // Simulate network latency
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockUsers);
    }, 300);
  });
};
