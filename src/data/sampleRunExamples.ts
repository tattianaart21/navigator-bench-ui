/** Примеры реальных путей и полей для демо-данных и значений по умолчанию в форме запуска.
 * В пути к Opera вместо плейсхолдера `<11111111>` используется тот же числовой идентификатор, что и в extension_dir. */

export const SAMPLE_WEB_BROWSER_PATH =
  "/home/work/11111111@sayonaraboy.ru/opera/usr/bin/opera";

export const SAMPLE_WEB_BROWSER_EXTENSION_DIR =
  "/home/work/11111111@sayonaraboy/configurable-plugin-opera/dist";

export const SAMPLE_WEB_BROWSER_USER_DIR =
  "/home/work/11111111@sayonaraboy.ru/opera/handlesstestt/";

/** Пример ответа судьи (успех), как в продакшене. */
export const DEMO_JUDGE_LLM_RESULT_SUCCESS = `To evaluate the success of the task, let's break down the instruction and compare it with the information provided in the screenshots and the result response.

### Instruction Breakdown:

1. **Find bedding (постельное белье) made of percale (перкаль)**.

2. **Size: Euro double (евродвушка)**.

3. **Thread count (плотность): 200-300**.

### Analysis of Screenshots and Result Response:

1. **Material (Материал)**:

- The screenshots show that the selected bedding is made of percale (Перкаль).

2. **Size (Размер)**:

- The screenshots indicate that the selected bedding is of Euro size (Евро).

3. **Thread Count (Плотность)**:

- The screenshots do not explicitly mention the thread count. However, the result response does not contradict this information, so we can assume it might be within the specified range.

### Conclusion:

- The screenshots and the result response confirm that the selected bedding meets the requirements for material (percale) and size (Euro double).

- The thread count is not explicitly mentioned in the screenshots, but there is no information that contradicts the specified range in the result response.

Given the above analysis, the task appears to be successfully accomplished.

**Verdict: SUCCESS**`;

export const DEMO_JUDGE_LLM_RESULT_FAIL =
  "Verdict: FAIL — требования задачи не выполнены (критерии не совпали со скриншотами или финальным ответом).";

const HISTORY_RUN = "d6788d5b-6666-45a0-8861-aae461c4daad";
const HISTORY_SESS = "b1b65f0d-d6ad-41af-9106-53782fe9d2d3";

const GIF_RUN = "d6788d5b-6568-45a0-8861-aae461c4daad";
const GIF_SESS = "b1b65f0d-d3ad-41af-9106-53782fe9d2d3";

/** Пример из ТЗ для первой таски; для остальных — тот же префикс, уникальный файл. */
export function demoHistoryJsonUrl(taskIndex: number): string {
  if (taskIndex === 1) {
    return `bench/history_json/${HISTORY_RUN}/${HISTORY_SESS}/ee5eb7a9-3d80-4246-9de9-4e34fcd16666.json`;
  }
  return `bench/history_json/${HISTORY_RUN}/${HISTORY_SESS}/task-${taskIndex}-ee5eb7a9-3d80-4246-9de9-4e34fcd16666.json`;
}

export function demoGifUrl(taskIndex: number): string {
  if (taskIndex === 1) {
    return `bench/gif/${GIF_RUN}/${GIF_SESS}/59d43c24-795d-4b56-9b43-77e3a1916b7a.gif`;
  }
  return `bench/gif/${GIF_RUN}/${GIF_SESS}/task-${taskIndex}-59d43c24-795d-4b56-9b43-77e3a1916b7a.gif`;
}
