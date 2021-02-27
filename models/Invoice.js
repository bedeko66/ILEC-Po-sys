class Invoice {
    constructor(id, poId, invocieId, supplier, department, manager, orderDate, description, validated) {
        this.id = id;
        this.poId = poId;
        this.invoiceId = invocieId;
        this.supplier = supplier;
        this.department = department;
        this.manager = manager;
        this.orderDate = orderDate;
        this.description = description;
        this.validated = validated

    }
}

module.exports = Invoice;