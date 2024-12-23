import Dropdown from '@/components/ui/Dropdown'
import { Link } from 'react-router-dom'

const WithRouterLink = () => {
    return (
        <div>
            <Dropdown title="Click Me!">
                <Dropdown.Item>
                    <Link
                        className="menu-item-link"
                        to="/ui-components/checkbox"
                    >
                        Checkbox
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/Button">
                        Button
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/alert">
                        Alert
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Link className="menu-item-link" to="/ui-components/Dialog">
                        Dialog
                    </Link>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default WithRouterLink
