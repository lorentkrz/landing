export const blurReveal = {
  initial: { opacity: 0, filter: "blur(3.5px)", y: 9 },
  whileInView: { opacity: 1, filter: "blur(0px)", y: 0 },
  viewport: { once: true, margin: "-5%" },
};
