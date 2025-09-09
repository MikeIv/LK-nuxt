export interface ApiGetOptions {
  /**
   * Таймаут запроса в миллисекундах
   * @default 30000
   */
  timeout?: number;

  /**
   * Дополнительные заголовки запроса
   */
  headers?: Record<string, string>;

  /**
   * Параметры запроса (для GET преобразуются в query string)
   */
  params?: Record<string, unknown>;

  /**
   * Автоматически добавлять contractId из store
   * @default true
   */
  useContractId?: boolean;
}
