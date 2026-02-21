import { ComponentExample } from "@/components/component-example"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <ModeToggle />
        </div>
        <ComponentExample />
      </div>
    </ThemeProvider>
  )
}

export default App
