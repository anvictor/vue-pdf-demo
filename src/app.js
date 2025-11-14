const { createApp } = Vue;

createApp({
  data() {
    return {
      email: "",
      table: [],
      number: 0,
    };
  },
  methods: {
    addRows() {
      this.table.push("Row A", "Row B");
      this.triggerSend();
    },
    changeNumber() {
      this.number = Math.floor(Math.random() * 100);
      this.triggerSend();
    },
    resetAll() {
      this.table = [];
      this.number = 0;
      this.triggerSend();
    },

    async triggerSend() {
      if (!this.email) {
        alert("Введіть email!");
        return;
      }

      await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          data: {
            table: this.table,
            number: this.number,
          },
        }),
      });
    },
  },
}).mount("#app");
