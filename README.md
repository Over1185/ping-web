# 🌐 Ping Web Tool

Una herramienta web moderna y profesional para verificar la conectividad de red y obtener información detallada de direcciones IP en tiempo real. Desarrollada con Astro.js y completamente funcional en el navegador.

## ✨ Características Principales

- 🎯 **Ping de Alta Precisión**: Algoritmo mejorado usando performance.mark/measure con múltiples intentos y análisis estadístico
- ⚡ **Monitoreo en Tiempo Real**: Sistema de ping automático continuo con intervalos configurables (1-10 segundos)
- 📊 **Estadísticas Avanzadas**: Seguimiento de pings enviados, tasa de éxito y promedio de latencia en tiempo real
- 🌍 **Información Completa de IP**: Datos detallados de geolocalización usando IPinfo.io API (sin API key requerida)
- 🎨 **Diseño Profesional**: Interfaz completamente rediseñada con colores sobrios y estética moderna
- � **Sistema de Temas**: Cambio dinámico entre tema claro y oscuro con detección automática de preferencia del sistema
- 📱 **Totalmente Responsive**: Diseño adaptable optimizado para móviles, tablets y escritorio
- ✅ **Validación Inteligente**: Verificación completa de formato IPv4 e IPv6
- 🔄 **Estados Visuales**: Indicadores en tiempo real con animaciones fluidas
- 🎨 **Código de Colores Inteligente**: Estados visuales basados en latencia y disponibilidad

## 🚀 Nuevas Funcionalidades v2.0

### 🔧 Precisión Mejorada

- Algoritmo de ping optimizado con performance.mark/measure
- Múltiples intentos (3-5) con análisis estadístico
- Eliminación de valores atípicos para mayor exactitud
- Cálculo de mediana y promedio para resultados más confiables

### ⏱️ Monitoreo Continuo

- **Ping automático en tiempo real** con controles intuitivos
- Intervalos configurables: 1, 2, 5, y 10 segundos
- Estadísticas en vivo: pings enviados, tasa de éxito, promedio de latencia
- Activación/desactivación instantánea del monitoreo

### 🎨 Interfaz Profesional

- **Diseño completamente renovado** con colores sobrios
- **Sistema de temas claro/oscuro** con cambio instantáneo
- Variables CSS para consistencia y mantenimiento
- Tipografía Inter para mejor legibilidad
- Animaciones suaves y transiciones elegantes

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión 18 o superior)
- pnpm (recomendado) o npm

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Over1185/ping-web.git

# Navegar al directorio
cd ping-web

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm run dev
```

La aplicación estará disponible en `http://localhost:4321`

### Construcción para Producción

```bash
# Generar build de producción
pnpm run build

# Previsualizar build
pnpm run preview
```

## 💡 Cómo Usar

### Uso Básico

1. **Carga Automática**: La página verifica automáticamente 1.1.1.1 al cargar
2. **IP Personalizada**: Introduce cualquier dirección IP válida en el campo de entrada
3. **Verificación Manual**: Haz clic en "🔍 Verificar IP" o presiona Enter
4. **Resultados Instantáneos**: Visualiza el ping mejorado y información detallada de la IP

### 🔄 Monitoreo en Tiempo Real (Nueva Funcionalidad)

1. **Activar Monitoreo**: Después de hacer un ping manual, activa "🔄 Ping automático en tiempo real"
2. **Configurar Intervalo**: Selecciona la frecuencia de ping (1, 2, 5 o 10 segundos)
3. **Estadísticas en Vivo**: Observa las métricas actualizarse automáticamente:
   - **Pings Enviados**: Contador total de pings realizados
   - **Éxito**: Porcentaje de pings exitosos
   - **Promedio**: Tiempo promedio de latencia en milisegundos

### 🌙 Sistema de Temas

- **Cambio Manual**: Haz clic en el botón 🌙/☀️ en la esquina superior derecha
- **Detección Automática**: Se adapta automáticamente a la preferencia de tu sistema
- **Persistencia**: Recuerda tu preferencia para futuras visitas

### 📊 Interpretación de Resultados

**Estados de Ping:**

- 🟢 **Excelente**: < 50ms - Conexión óptima
- 🟡 **Bueno**: 50-150ms - Conexión aceptable  
- 🔴 **Lento**: > 150ms - Conexión lenta

**Precisión Mejorada:**

- Múltiples intentos por ping para mayor exactitud
- Eliminación automática de valores atípicos
- Cálculo estadístico de mediana y promedio

### IPs de Prueba Recomendadas

- `1.1.1.1` - Cloudflare DNS
- `8.8.8.8` - Google DNS
- `1.0.0.1` - Cloudflare DNS secundario
- `8.8.4.4` - Google DNS secundario
- `2001:4860:4860::8888` - Google DNS IPv6

## 🔧 Tecnologías Utilizadas

- **Frontend**: Astro.js
- **Estilo**: CSS3 con animaciones y gradientes
- **API**: IPinfo.io para información de geolocalización
- **Ping**: Simulación usando fetch() y performance.now()
- **Validación**: Regex para IPv4 e IPv6

## 📊 Información Mostrada

### Ping

- IP objetivo
- Tiempo de respuesta en milisegundos
- Estado de conexión (Online/Sin respuesta/Timeout)

### Información de IP

- Dirección IP
- Ciudad y región
- País
- Coordenadas geográficas
- Organización/ISP
- Código postal
- Zona horaria

## 🎨 Estados Visuales

- 🟢 **Verde**: Ping exitoso (< 50ms excelente, < 150ms bueno)
- 🟡 **Amarillo**: Ping regular (> 150ms) o timeout
- 🔴 **Rojo**: Sin respuesta o error de conexión

## ⚙️ Funcionalidades Técnicas

### Ping Simulado

Debido a las limitaciones del navegador, no es posible realizar ping ICMP real. La aplicación simula el ping usando:

- Peticiones HTTP HEAD con `fetch()`
- Medición de tiempo con `performance.now()`
- Timeout configurable (5 segundos por defecto)
- Manejo de errores CORS y de red

### Validación de IP

- **IPv4**: Formato estándar (0-255.0-255.0-255.0-255)
- **IPv6**: Formato hexadecimal simplificado
- Mensajes de error descriptivos

### API de Geolocalización

- Uso de IPinfo.io API pública
- Sin necesidad de API key para uso básico
- Manejo de límites de tasa
- Fallback para errores de API

## 🌟 Mejoras Futuras

- [ ] Historial de pings
- [ ] Gráficos de latencia en tiempo real
- [ ] Exportar resultados
- [ ] Múltiples IPs simultáneas
- [ ] Configuración de timeout personalizable
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## 📝 Limitaciones

1. **No es ping real**: Utiliza peticiones HTTP para simular ping
2. **CORS**: Algunas IPs pueden no responder debido a políticas CORS
3. **Precisión**: Los tiempos pueden variar según la implementación del navegador
4. **Límites de API**: IPinfo.io tiene límites en su tier gratuito

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

Creado con ❤️ para la comunidad de desarrollo web.

## 🙏 Agradecimientos

- [Astro.js](https://astro.build/) - Framework web moderno
- [IPinfo.io](https://ipinfo.io/) - API de geolocalización de IP
- [CSS Gradient](https://cssgradient.io/) - Generador de gradientes
- Comunidad de desarrolladores por feedback y sugerencias

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!
