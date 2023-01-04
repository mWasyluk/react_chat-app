import { maxAvatarSize, maxAvatarSizeInKB, supportedAvatarTypes } from '../../utils/avatar-utils'

import DefaultAvatar from '../../assets/default-avatar.png'
import { FaPencilAlt } from 'react-icons/fa'
import { useState } from 'react'

const editFileIcon = <FaPencilAlt></FaPencilAlt>;
const reader = new FileReader();

const AvatarSelector = (props) => {
    const {
        selectFile = () => { }
    } = props
    const [src, setSrc] = useState(DefaultAvatar)

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (!supportedAvatarTypes.includes(file.type)) {
            console.error("The file type is not supported yet.")
        }
        else if (file.size > maxAvatarSize) {
            console.error("The file is too large. Max. size is", maxAvatarSizeInKB + "KB.")
        }
        else {
            reader.readAsDataURL(file);
            reader.onload = e => {
                setSrc(e.target.result);
            }
            selectFile(file);
        }
    }

    return (
        <div className="avatar-selector">
            <input type='file' className="avatar-input" onChange={handleInputChange} name="image" id='avatar-input' accept="image/jpeg, image/png"></input>

            <label htmlFor="avatar-input" className="avatar-image">
                <img alt='Avatar preview' src={src}></img>
            </label>
            <label htmlFor="avatar-input" className="avatar-image-cover">
                {editFileIcon}
            </label>
        </div >
    )
}

export default AvatarSelector;