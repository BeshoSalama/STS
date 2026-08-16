UPDATE [dbo].[ManualPaymentSettings]
SET [vodafoneCashInstructions] = 'Transfer the exact plan amount to one of the Vodafone Cash numbers shown, keep a screenshot, then submit the transfer details below.'
WHERE [id] = 1
  AND (
    [vodafoneCashInstructions] IS NULL
    OR [vodafoneCashInstructions] = ''
    OR [vodafoneCashInstructions] = 'Transfer the exact plan amount to the Vodafone Cash number shown, keep a screenshot, then submit the transfer details below.'
  );
