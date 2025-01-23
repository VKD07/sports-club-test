import { setDefaultTimeZone } from 'date-fns-tz'

export default {
  async install() {
    // Set default timezone
    setDefaultTimeZone('Africa/Lagos')
  },
}
