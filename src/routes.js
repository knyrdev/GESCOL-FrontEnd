import React from "react"

const dashboard = React.lazy(() => import("./views/dashboard/Dashboard.js"))
const users = React.lazy(() => import("./views/pages/user/user.js"))
const registro = React.lazy(() => import("./views/pages/registro/registro-estudiantil-main.js"))
const matricula = React.lazy(() => import("./views/pages/matricula/matricula.js"))
const brigadas = React.lazy(() => import("./views/pages/brigada/brigada.js"))
const secciones = React.lazy(() => import("./views/pages/secciones/secciones.js"))
const personal = React.lazy(() => import("./views/pages/personal/personal.js"))
const login = React.lazy(() => import("./views/pages/login/Login.js"))
const register = React.lazy(() => import("./views/pages/register/Register.js"))
const profile = React.lazy(() => import("./views/pages/profile/profile.js"))
const infoMatricula = React.lazy(() => import("./views/pages/matriculaInformacion/matriculaInfo.js"))
const estudiantes = React.lazy(() => import("./views/pages/estudiantes/estudiantes.js"))
const representantes = React.lazy(() => import("./views/pages/representantes/representantes.js"))

const routes = [
  { path: "/", exact: true, name: "Home" },
  { path: "/dashboard", name: "Dashboard", element: dashboard },
  { path: "/users", name: "Usuarios", element: users },
  { path: "/registro", name: "Registro", element: registro },
  { path: "/matricula", name: "Matricula", element: matricula },
  { path: "/brigadas", name: "Brigadas", element: brigadas },
  { path: "/secciones", name: "Secciones", element: secciones },
  { path: "/personal", name: "Personal", element: personal },
  { path: "/login", name: "Login", element: login },
  { path: "/register", name: "Register", element: register },
  { path: "/profile", name: "Profile", element: profile },
  { path: "/infoMatricula/:id", name: "Información de estudiante", element: infoMatricula },
  { path: "/estudiantes", name: "Estudiantes", element: estudiantes },
  { path: "/representantes", name: "Representantes", element: representantes },
]

export default routes
