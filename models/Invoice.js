class Invoice {
    constructor(id, poId, invoiceId, supplier, department, manager, orderDate, description, validated, status, invoice_signed_by, invoice_signed_at, file_name) {
        this.id = id;
        this.poId = poId;
        this.invoiceId = invoiceId;
        this.supplier = supplier;
        this.department = department;
        this.manager = manager;
        this.orderDate = orderDate;
        this.description = description;
        this.validated = validated;

        this.status = status;
        this.invoice_signed_by = invoice_signed_by;
        this.invoice_signed_at = invoice_signed_at;
        this.file_name = file_name;

    }
}

module.exports = Invoice;