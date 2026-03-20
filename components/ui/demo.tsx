import { Briefcase, FileText, Home, User } from "lucide-react"
import { NavBar } from "@/components/ui/tubelight-navbar"

export function NavBarDemo() {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "About", url: "/about", icon: User },
    { name: "Courses", url: "/courses", icon: Briefcase },
    { name: "Terms", url: "/terms", icon: FileText },
  ]

  return <NavBar items={navItems} />
}
