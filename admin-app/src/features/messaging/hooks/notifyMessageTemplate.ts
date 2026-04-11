import type { ORDER_EVENT_KEYS } from "@/features/order/domain/orderEvents";
import { useEmailMessages } from "../emailMessage/hooks";
import { useSmsMessages } from "../smsMessage/hooks";

type NotifyProps = {
    event : ORDER_EVENT_KEYS
}

export const notifyMessageTemplate = ({event}:NotifyProps)=>{
    const emailTemplates = useEmailMessages()
    const smsTemplates = useSmsMessages()

    const hasEmailTemplateEvent = emailTemplates.some(
        email => email.event === event && email.ask_permission === true && email.enable == true
    )
    const hasSmsTemplateEvent = smsTemplates.some(
        sms => sms.event === event && sms.ask_permission === true && sms.enable == true
    )
    return hasEmailTemplateEvent || hasSmsTemplateEvent
}