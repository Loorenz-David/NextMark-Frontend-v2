import { useEffect } from 'react'
import { useSectionPanel } from './SectionPanelContext'
import type { SectionHeaderConfig } from './SectionPanelContext'


export const SectionHeader = ({title, icon, buttons, actions, closeButton, DotMenuActions, headerButtonsBgClass}: SectionHeaderConfig) => {
    const { setHeader } = useSectionPanel();

    useEffect(() => {

        setHeader({
            title,
            icon,
            closeButton,
            DotMenuActions,
            headerButtonsBgClass,
            buttons: buttons ? [buttons] : [],
            actions: actions || [],
        });

        return () => {
            setHeader(null);
        }
    }, [title, icon, buttons, actions, closeButton, DotMenuActions, headerButtonsBgClass]);

    return null
}
