class PCMPlayerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.queue = [];

    this.port.onmessage = (e) => {
      if (e.data.type === "push") {
        this.queue.push(new Float32Array(e.data.audio));
      }
      if (e.data.type === "clear") {
        this.queue = [];
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0][0];

    if (this.queue.length === 0) {
      output.fill(0);
      return true;
    }

    let offset = 0;

    while (offset < output.length && this.queue.length > 0) {
      const chunk = this.queue[0];
      const remaining = output.length - offset;
      const copyCount = Math.min(remaining, chunk.length);

      output.set(chunk.subarray(0, copyCount), offset);

      if (copyCount < chunk.length) {
        this.queue[0] = chunk.subarray(copyCount);
      } else {
        this.queue.shift();
      }

      offset += copyCount;
    }

    if (offset < output.length) output.fill(0, offset);

    return true;
  }
}

registerProcessor("pcm-player", PCMPlayerProcessor);
