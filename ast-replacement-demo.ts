import { MAGIC_2000 } from "@/constants/count";
import { MAGIC_0_8 } from "@/constants/decimal";
import { BYTES_PER_KB } from "@/constants/magic-numbers";
import { DAYS_PER_WEEK } from "@/constants/time";

// AST替换演示文件
export function demoFunction() {
  const timeout = MAGIC_2000;
  const percentage = MAGIC_0_8;
  const count = DAYS_PER_WEEK;
  const size = BYTES_PER_KB;

  return {
    timeout,
    percentage,
    count,
    size,
    result: timeout * percentage + count * size
  };
}
