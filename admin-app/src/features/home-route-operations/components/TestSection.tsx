
import { BasicButton } from '@/shared/buttons/BasicButton'
import {useSectionPanel} from '../../../shared/section-panel/SectionPanelContext'
import { useEffect } from 'react';
import {OrderIcon} from '@/assets/icons';
import {InfoIcon, LayersIcon, StatsIcon, MessageIcon} from '@/assets/icons';

type Props = {
    onClose: () => void;
}

const OrdersSection = ({onClose}: Props) => {
    const {setHeader} = useSectionPanel();

    const closing = ()=>{
        onClose();

    }

    useEffect(() => {
        setHeader({
            title: 'Orders Section',
            buttons:[
                <BasicButton key="route" params={{
                    variant: "primary",
                    onClick: closing,
                }}>
                    + Route
                </BasicButton> ,
                <BasicButton key="stats" params={{
                    variant: "secondary",
                    onClick: closing,
                }}>
                    <div className=" flex items-center gap-3 ">
                        <StatsIcon className="w-5 h-5 app-icon" /> Stats

                    </div>
                </BasicButton>,
                <BasicButton key="edit" params={{
                    variant: "secondary",
                    onClick: closing,
                }}>
                    <div className=" flex items-center gap-3 ">
                        <MessageIcon className="w-5 h-5 app-icon" /> Edit

                    </div>
                </BasicButton>  
            ],
            actions: [
                {icon: <InfoIcon className="w-5 h-5 app-icon" />, label: 'Stats', value: 'close' },
                {icon: <LayersIcon className="w-5 h-5 app-icon" />, label: 'Print labels', value: 'some' }
            ],
            icon: <OrderIcon className="w-5 h-5 app-icon" />
        });

        return () => {
            setHeader(null);
        };
    }, [setHeader]);
    return ( 
        <div className="h-full w-full flex flex-col ">
            <div className="w-full h-20 bg-gray-200 mb-2">
                Test Section

            </div>
            {/* <BasicButton params={{
                variant: "rounded",
                onClick: closing,
            }}>Close</BasicButton>
            <BasicButton params={{
                variant: "primary",
                onClick: openNext,
            }}>next</BasicButton> */}


        </div> 
    );
}
 
export default OrdersSection;
