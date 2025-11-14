const { createApp } = Vue;

createApp({
  data() {
    return {
      email: "",
      table: [],
      number: 0,
      sending: false,
    };
  },
  methods: {
    addRows() {
      this.table.push("Row " + (this.table.length + 1));
      this.table.push("Row " + (this.table.length + 1));
      this.sendPdf();
    },
    changeNumber() {
      this.number = Math.floor(Math.random() * 1000);
      this.sendPdf();
    },
    resetAll() {
      this.table = [];
      this.number = 0;
      this.sendPdf();
    },

    async sendPdf() {
      if (!this.email) {
        alert("Введіть email!");
        return;
      }

      // не дозволяємо одночасні відправки
      if (this.sending) return;
      this.sending = true;

      try {
        const payload = {
          email: this.email,
          data: {
            table: this.table,
            number: this.number,
          },
        };

        const resp = await fetch("/api/send-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error("Server error:", txt);
          alert("Помилка на сервері. Подивись консоль.");
        } else {
          alert("PDF згенеровано та надіслано на " + this.email);
        }
      } catch (err) {
        console.error(err);
        alert("Помилка запиту. Перевір консоль.");
      } finally {
        this.sending = false;
      }
    },
  },
}).mount("#app");
