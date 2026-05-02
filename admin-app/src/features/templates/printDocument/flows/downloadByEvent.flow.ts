import { ApiError } from "@/lib/api/ApiClient";
import { useMessageHandler } from "@shared-message-handler";

import { downloadBlob } from "../controllers/downloadBlob.controller";
import { renderPdfDocument } from "../controllers/renderPdfDocument.controller";
import { resolveActiveTemplateByChannelAndEvent } from "../domain/resolveActiveTemplate";
import { resolveVariantDefinition } from "../domain/resolveVariantDefinition";
import { usePrintTemplateFlow } from "./printTemplate.flow";
import type { availableChannels, availableEvents } from "../types";

type DownloadByEventParams = {
  channel: availableChannels;
  event: availableEvents;
  data: unknown;
  fileName: string;
  onProgress?: (progress: number) => void;
};

export const useDownloadTemplateByEventFlow = () => {
  const { showMessage } = useMessageHandler();
  const { loadAllPrintTemplate } = usePrintTemplateFlow();

  const downloadByEvent = async ({
    channel,
    event,
    data,
    fileName,
    onProgress,
  }: DownloadByEventParams): Promise<void> => {
    try {
      let activeTemplate = resolveActiveTemplateByChannelAndEvent(
        channel,
        event,
      );

      if (!activeTemplate) {
        await loadAllPrintTemplate();
        activeTemplate = resolveActiveTemplateByChannelAndEvent(channel, event);
      }

      if (!activeTemplate) {
        showMessage({
          status: 404,
          message: "No active print template found for this event.",
        });
        return;
      }

      const variantDefinition = resolveVariantDefinition(
        channel,
        activeTemplate.selected_variant,
      );
      if (!variantDefinition) {
        showMessage({
          status: 404,
          message: "Selected template variant not found.",
        });
        return;
      }

      const blob = await renderPdfDocument(
        variantDefinition.drawFn,
        data,
        variantDefinition.widthCm,
        variantDefinition.heightCm,
        activeTemplate.orientation,
        onProgress,
      );

      downloadBlob(blob, fileName);
    } catch (error) {
      if (error instanceof ApiError) {
        showMessage({ status: error.status, message: error.message });
        return;
      }
      showMessage({
        status: 500,
        message: "Unable to generate print document.",
      });
    }
  };

  return {
    downloadByEvent,
  };
};
