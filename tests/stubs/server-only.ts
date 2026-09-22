// Stub para tests: "server-only" se apoya en la condición de exports
// "react-server" que resuelve Next (webpack/Turbopack) pero que Vite/Vitest no
// entiende, así que fuera de Next siempre cargaría la versión que lanza error.
// No hace falta el guard en los tests: aquí nunca se ejecuta en un Client Component.
export {};
