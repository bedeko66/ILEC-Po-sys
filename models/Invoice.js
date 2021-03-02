class Invoice {
    constructor(id, poId, invoiceId, supplier, department, manager, orderDate, comments, validated, status, invoice_signed_by, invoice_signed_at, file_name, invoice_date, invoice_net, vat_amount, invoice_ttl) {
        this.id = id;
        this.poId = poId;
        this.invoiceId = invoiceId;
        this.supplier = supplier;
        this.department = department;
        this.manager = manager;
        this.orderDate = orderDate;
        this.comments = comments;
        this.validated = validated;
        this.status = status;
        this.invoice_signed_by = invoice_signed_by;
        this.invoice_signed_at = invoice_signed_at;
        this.file_name = file_name;

        this.invoice_date = invoice_date;
        this.invoice_net = invoice_net;
        this.vat_amount = vat_amount;
        this.invoice_ttl = invoice_ttl;

    }
}

module.exports = Invoice;