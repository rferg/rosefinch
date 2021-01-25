import { svg } from 'lit-element'
import { NotationComponent } from '../notation-component'

export const flatAccidental = svg`
    <symbol id="${NotationComponent.Flat}" viewBox="0 0 5 12" preserveAspectRatio="none">
        <path d="M3.219 8.37687c0 .575-.215575 1.12573-.807 1.86488C1.785435 11.02481 1.258 11.473.563 12V8.56787c.158-.399.391-.722.7-.97.308-.247.62-.371.936-.371.522 0 .853.296.996.886.016.048.024.136.024.264zm-.075-2.4c-.431 0-.869.119-1.315.358-.446.238-.868.557-1.266.954V.0172H0V12.472c0 .352.096.528.288.528.111 0 .248913-.093.455-.216.58334-.34815.946935-.58081 1.342-.82625.450617-.27996.958-.60688 1.629-1.24688.463-.465.798-.934 1.006-1.406.207-.473.311-.941.311-1.406 0-.688-.183-1.177-.549-1.466-.414-.304-.861-.456-1.338-.456z"></path>
    </symbol>
`