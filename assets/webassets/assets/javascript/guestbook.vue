<template>
  <div class="guestbook">
    <h2>Guestbook</h2>

    <form @submit.prevent="addEntry" class="form">
      <input v-model="form.name" placeholder="Name" required />
      <input v-model="form.country" placeholder="Country" required />
      <input v-model="form.email" placeholder="Email" required />
      <textarea v-model="form.message" placeholder="Message" required></textarea>

      <button type="submit">Send</button>
    </form>

    <div v-for="entry in entries" :key="entry.id" class="entry">
      <p><strong>Name:</strong> {{ entry.name }}</p>
      <p><strong>Country:</strong> {{ entry.country }}</p>
      <p><strong>Email:</strong> {{ entry.email }}</p>
      <p><strong>Message:</strong> {{ entry.message }}</p>
      <small>{{ formatDate(entry.date) }}</small>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: "",
        country: "",
        email: "",
        message: ""
      },
      entries: []
    };
  },

  methods: {
    async loadEntries() {
      const res = await fetch("http://localhost:3000/guestbook");
      this.entries = await res.json();
    },

    async addEntry() {
      await fetch("http://localhost:3000/guestbook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.form)
      });

      await this.loadEntries();

      this.form = {
        name: "",
        country: "",
        email: "",
        message: ""
      };
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  },

  mounted() {
    this.loadEntries();
  }
};
</script>

<style scoped>
.guestbook {
  max-width: 600px;
  margin: auto;
}

.form input,
.form textarea {
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 8px;
}

.entry {
  margin-top: 15px;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
}
</style>