import { License } from "yfiles"
import yFilesLicense from '../license.json'

export default () : void => {
    License.value = yFilesLicense
}