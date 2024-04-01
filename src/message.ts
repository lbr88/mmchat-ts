export class Message {
  seq: number;
  event: string;
  data: any;
  post: any;
  constructor(seq: number, data: any, event: string) {
    this.seq = seq;
    this.event = event;
    this.data = data;
    if (data.post) {
      this.post = this.getPost();
    }
  }
  private getPost() {
    if (!this.data.post) {
      return null;
    }
    try {
      const jsonPost = JSON.parse(this.data.post);
      return jsonPost
    } catch (e) {
      console.error('Error parsing post', e);
      return null;
    }
  }
}
