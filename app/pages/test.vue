<script setup lang="ts">
  const { user, error, isLoading, fetchUser } = useUser();

  // Загружаем данные при монтировании
  onMounted(async () => {
    await fetchUser();
  });
</script>

<template>
  <!-- Объединил условия загрузки и ошибки -->
  <div v-if="isLoading">Загрузка данных пользователя...</div>

  <div v-else-if="error" class="error">
    Ошибка: {{ error }}
    <!-- Упростил вывод ошибки, так как в useUser error - это string | null -->
  </div>

  <div v-else-if="user">
    <h2>Данные пользователя:</h2>
    <p>Наименование: {{ user.tenant_name }}</p>
    <p>Бренд: {{ user.brand }}</p>
    <p>Номер помещения: {{ user.room_number }}</p>

    <h3>Текущий договор:</h3>
    <p>Номер: {{ user.contract_number }}</p>
    <p>Тип: {{ user.contract_type }}</p>
    <p>Дата заключения: {{ user.contract_date }}</p>
    <p>Задолженность: {{ user.debt }}</p>

    <h3>ККТ:</h3>
    <ul>
      <li v-for="kkt in user.kkts" :key="kkt">
        {{ kkt }}
      </li>
    </ul>

    <h3>Доступные договоры:</h3>
    <ul>
      <li v-for="contract in user.contracts" :key="contract.id">
        {{ contract.name }} (ID: {{ contract.id }})
      </li>
    </ul>
  </div>

  <div v-else>Данные пользователя недоступны</div>
</template>

<style scoped>
  .error {
    color: red;
    padding: 1rem;
    border: 1px solid red;
    margin: 1rem 0;
  }
</style>

