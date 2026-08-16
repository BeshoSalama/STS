ALTER TABLE [dbo].[ManualPaymentSettings] ADD [vodafoneCashSecondNumber] NVARCHAR(1000);

EXEC('
UPDATE [dbo].[ManualPaymentSettings]
SET
    [vodafoneCashNumber] = COALESCE(NULLIF([vodafoneCashNumber], ''''), ''01039839414''),
    [vodafoneCashSecondNumber] = COALESCE(NULLIF([vodafoneCashSecondNumber], ''''), ''01021804116''),
    [instapayAddress] = COALESCE(NULLIF([instapayAddress], ''''), ''01021804116'')
WHERE [id] = 1;
');
