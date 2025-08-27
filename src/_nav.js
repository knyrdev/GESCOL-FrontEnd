import CIcon from "@coreui/icons-react"
import {
  cilSpeedometer,
  cibMyspace,
  cibVerizon,
  cilBook,
  cilEducation,
  cilUser,
  cilSchool,
  cilGroup,
} from "@coreui/icons"
import { CNavItem, CNavTitle } from "@coreui/react"

const _nav = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: "info",
      text: "INFO JGM",
    },
  },
  {
    component: CNavTitle,
    name: "Administracion",
  },
  {
    component: CNavItem,
    name: "Registro",
    to: "/registro",
    icon: <CIcon icon={cibVerizon} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Brigada Estudiantil",
    to: "/brigadas",
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Estudiantes",
    to: "/estudiantes",
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: "Académico",
  },
  {
    component: CNavItem,
    name: "Matricula Estudiantil",
    to: "/matricula",
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: "Secciones",
    to: "/secciones",
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: "Personal",
  },
  {
    component: CNavItem,
    name: "Personal",
    to: "/personal",
    icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: "Sistema",
  },
  {
    component: CNavItem,
    name: "Usuarios",
    to: "/users",
    icon: <CIcon icon={cibMyspace} customClassName="nav-icon" />,
  },
]

export default _nav
