<script setup lang="ts"></script>

<template>
  <div>
    <div :class="$style.wrapper">
      <CashiersHeader main-title="Мои заявки" step-title="" />
      <section :class="$style.content">
        <div :class="$style.banner">
          <div :class="$style.bannerContent">
            <div :class="$style.iconWrapper">
              <svg
                :class="$style.icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 6V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h2 :class="$style.title">Модуль в разработке</h2>
            <p :class="$style.description">
              Мы активно работаем над этим разделом. Скоро здесь появится
              функционал для управления вашими заявками. Спасибо за терпение!
            </p>
            <div :class="$style.progress">
              <div :class="$style.progressBar">
                ours
                <div :class="$style.progressFill" />
                <div :class="$style.progressFill" />
                theirs
              </div>
              <span :class="$style.progressText">65% завершено</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style module lang="scss">
  .wrapper,
  .content {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .banner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 40px 20px;
    background: linear-gradient(
      135deg,
      var(--a-bgLight) 0%,
      var(--a-bgSepia) 100%
    );
    border-radius: 16px;
    margin: 20px;
    border: 2px solid var(--a-bgAccentExLight);
    box-shadow: 0 8px 32px rgba(166, 133, 86, 0.1);
  }

  .bannerContent {
    text-align: center;
    max-width: 500px;
  }

  .iconWrapper {
    margin-bottom: 24px;
  }

  .icon {
    width: 80px;
    height: 80px;
    color: var(--a-bgAccentDark);
    opacity: 0.8;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 600;
    color: var(--a-bgAccentDark);
    margin-bottom: 16px;
    line-height: 1.2;
  }

  .description {
    font-size: 1.1rem;
    color: var(--a-mainTextLight);
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .progressBar {
    width: 300px;
    height: 8px;
    background-color: var(--a-bgGrayLight);
    border-radius: 4px;
    overflow: hidden;
  }

  .progressFill {
    width: 65%;
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--a-bgAccent) 0%,
      var(--a-bgAccentDark) 100%
    );
    border-radius: 4px;
    animation: progressAnimation 2s ease-in-out;
  }

  .progressText {
    font-size: 0.9rem;
    color: var(--a-mainTextLight);
    font-weight: 500;
  }

  @keyframes progressAnimation {
    0% {
      width: 0%;
    }
    100% {
      width: 65%;
    }
  }

  @media (max-width: 768px) {
    .banner {
      margin: 10px;
      padding: 30px 15px;
    }

    .title {
      font-size: 2rem;
    }

    .progressBar {
      width: 250px;
    }
  }
</style>
