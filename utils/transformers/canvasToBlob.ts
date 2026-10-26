export const canvasToBlob = async (canvas: HTMLCanvasElement) => {
  if (!canvas) throw new Error('Canvas не найден');

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

  if (!blob) throw new Error('Не удалось сформировать Blob');

  const formData = new FormData();
  formData.append('avatar', blob, 'avatar.png');
  return formData;
};
